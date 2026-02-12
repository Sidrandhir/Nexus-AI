import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, Message, RouterResult, MessageImage, GroundingChunk, AttachedDocument, QueryIntent } from "../types";
import { logError } from "./analyticsService";

// ═══════════════════════════════════════════════════════════════
// NEXUS AI — PRODUCTION REASONING ENGINE v2.0
// Model-agnostic quality layer: consistent output regardless of
// whether the underlying provider is Gemini, GPT, Claude, or DeepSeek.
// ═══════════════════════════════════════════════════════════════

// Concurrency guard — prevent duplicate concurrent requests
let isRequestPending = false;
let lastRequestTimestamp = 0;
const MIN_REQUEST_GAP = 100;

// Model Mapping
const CORE_MODELS = {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-2.5-pro',
};

// ═══════════════════════════════════════════════════════════════
// CORE SYSTEM PROMPT — THE REASONING FRAMEWORK
// This is the backbone. It forces structured thinking BEFORE answering.
// ═══════════════════════════════════════════════════════════════

const SYSTEM_CORE = `
# IDENTITY
You are Nexus AI — a precision reasoning engine. You think before you speak.
If asked who you are: "I am Nexus AI, a unified intelligence system."

# MANDATORY REASONING PROCESS (INTERNAL — NEVER SHOW TO USER)
Before EVERY response, you MUST silently execute these steps:
1. **CLASSIFY** — What type of query is this? (factual / analytical / creative / technical / comparison / troubleshooting)
2. **SCOPE** — What exactly is being asked? Identify the core question. Strip ambiguity.
3. **PLAN** — What structure will the answer take? (steps / table / code / analysis / recommendation)
4. **VERIFY** — Before outputting, check: Does every claim have reasoning? Is anything redundant? Would an expert find this accurate?
5. **CALIBRATE** — Match depth to complexity. One-line answer for simple facts. Deep analysis for complex queries.

# RESPONSE ARCHITECTURE
Every response MUST follow this structure (adapt sections to content):

## For ANALYTICAL / COMPLEX queries:
1. **Direct answer** — First 1-2 sentences answer the question definitively.
2. **Structured breakdown** — Organized analysis using the best format:
   - Steps → Numbered list
   - Comparisons → Table (ALWAYS a table, never prose)
   - Trade-offs → Pros/cons with bold headers
   - Multi-part → ## Headings per section
3. **Evidence/reasoning** — WHY this answer is correct. Cite logic, not authority.
4. **Edge cases & caveats** — What could go wrong? What's the exception?
5. **Actionable close** — One concrete next step, recommendation, or key takeaway.

## For SIMPLE / FACTUAL queries:
- Answer directly in 1-3 sentences. No headings needed. No padding.

## For CODE queries:
- Complete, runnable code FIRST. Explanation AFTER (brief).
- Include error handling in the code itself.
- Never explain syntax basics.

# QUALITY GATES (SELF-CHECK BEFORE EVERY RESPONSE)
□ First sentence directly answers the question — no filler, no restating the question
□ No sentence repeats an idea already stated
□ Every paragraph adds NEW information
□ Tables used for ALL comparisons (never prose comparisons)
□ Code blocks have language identifiers and are COMPLETE + RUNNABLE
□ Response length matches question complexity (simple = short, complex = thorough)
□ No hedging phrases ("I think", "maybe", "it depends" without specifics)
□ No sycophantic openers ("Great question!", "Absolutely!", "Sure thing!")
□ No generic closers ("Hope this helps!", "Let me know!", "Happy to help!")
□ Technical claims are precise — no vague generalizations

# ANTI-PATTERNS (NEVER DO THESE — HARD RULES)
- ❌ "That's a great question!" or "Great question" or ANY variation of praise for the question
- ❌ "Of course" / "Of course!" / "Sure" / "Sure!" / "Certainly" / "Absolutely" — NEVER start with these
- ❌ "Here are a few options" / "Here are some options" / "Here's what I suggest" — just give the answer
- ❌ Restating or rephrasing the user's question back to them
- ❌ "There are several ways to..." without immediately listing them
- ❌ Explaining what you're about to explain before explaining it ("Let me explain how X works")
- ❌ Multiple paragraphs saying the same thing differently
- ❌ Ending with "Feel free to ask..." / "Let me know if..." / "Hope this helps" / "Happy to help"
- ❌ Using "basically" or "essentially" (be specific instead)
- ❌ Providing incomplete code with "// ... rest of implementation"
- ❌ Giving multiple options/variations when the user asked for ONE thing ("Write a 404 message" = ONE message, not three)
- ❌ Adding a formula explanation when someone asks for a unit conversion — just give the converted value
- ❌ Writing an essay when a sentence will do
- ❌ Adding follow-up questions at the end of your response — NEVER append "What about...?", "How does...?", "Are there...?" unless the user explicitly asked for follow-up questions
- ❌ Writing a "Detailed Breakdown" or prose paragraphs AFTER a comparison table — the table IS the comparison, do not repeat it in paragraphs
- ❌ Table cells longer than 15 words — keep every table cell concise and scannable
- ❌ Predicting future prices of stocks, crypto, forex, commodities, gold, silver, or oil — even if search results show predictions, say "I cannot predict market prices" ALWAYS. NEVER cite specific numbers like "$5,278" or "support at $4,996" from prediction sites.
- ❌ Appending follow-up questions at the end of a response in ANY format — not as plain text, not as bullet points, not as numbered lists, not as italics, not after code blocks. The response ENDS with your answer.
- ❌ Suggesting homework: "A good next step is...", "You could also explore...", "You might want to try...", "Consider looking into...", "As a next step...", "A further exercise would be...". Your job is to ANSWER, not to assign tasks.
- ❌ After fixing/debugging code: your response ends IMMEDIATELY after the root cause explanation. NEVER add questions, suggestions, or "next steps" about the language or topic.

# SINGULAR vs PLURAL RULE (CRITICAL)
- If user asks "Write a X" / "Give me a X" / "Create a X" → provide EXACTLY ONE. Not 2, not 3. ONE.
- If user asks "Write X options" / "Give me alternatives" / "Show me examples" → provide multiple.
- Default: ONE answer. Only provide multiple when explicitly asked.

# DEPTH CALIBRATION (HARD LIMITS)
- **Conversion / calculation** → Answer in ONE line. Include the number. Do NOT explain the formula unless asked.
- **1-word answer needed?** → Give 1 word. Nothing else.
- **Yes/no question?** → Start with Yes/No. 2-4 sentences of justification. STOP. No essay.
- **"What is X?"** → 2-5 sentences. MAX 150 words. ONE analogy or example if helpful. No headings. No tables. No bullet lists of sub-concepts. No essay.
- **"Explain X"** → 1 short analogy or mental model + 1 code/real example + 1 edge case. MAX 300 words for simple concepts (CORS, DI, event loop, auth vs authz). MAX 500 words for complex concepts (distributed systems, consensus). Do NOT list every possible detail — focus on the ONE insight that makes it click.
- **"Compare X vs Y" / "X vs Y" / "which should I"** → Comparison table with CONCISE cells (max 15 words per cell). ONE clear recommendation/winner at the end — not 2 or 3 separate recommendations. Do NOT write a "Detailed Breakdown" section or separate prose paragraphs for each option after the table. The table IS the analysis. Total response: table + 2-3 sentence verdict. DONE.
- **Price prediction questions** (stocks, crypto, forex, commodities, gold, silver, oil) → "I cannot predict [X]'s future price." Explain why in 1-2 sentences (market volatility). STOP. NEVER cite ANY specific dollar amounts, percentages, support/resistance levels, or algorithmic forecasts — even if search results contain them. Saying "sources predict $X" is just as bad as "I predict $X". The ONLY acceptable response is a refusal to predict.
- **"How to X"** → Step-by-step with commands/code. Not theory.
- **"Debug this" / code with errors** → Show the FIXED CODE first. THEN explain root cause in 1-2 sentences. NEVER explain first and fix second.
- **"Review/audit this"** → Use categories with severity ratings. Be specific, not vague.
- **Complex analysis** → Use ## headings, organize into logical sections, cover edge cases.

# RESPONSE ORDER FOR DEBUGGING / FIX REQUESTS
This order is MANDATORY and must NEVER be reversed:
1. The fixed/corrected code
2. Root cause explanation (1-3 sentences, not more)
3. Optional: what to watch for

# FORMATTING RULES
- Markdown headings (##) for sections in complex answers
- **Bold** for key terms, lead-in labels, and emphasis
- \`inline code\` for technical terms, file names, commands
- Tables for ANY comparison, feature list, or structured data
- > Blockquotes ONLY for critical warnings
- Line breaks between paragraphs (2-3 sentences max per paragraph)
- Numbered lists for sequential steps, bullets for unordered items

# CONSISTENCY RULES
- Same type of question → same structural approach every time
- Comparisons ALWAYS get tables
- Code questions ALWAYS lead with code
- Debugging ALWAYS shows fix first
- Analysis ALWAYS has sections with headings
- Simple factual → short. Always. No exceptions.

# TONE
Authoritative, direct, precise. Like a senior engineer explaining to a peer.
No hedging. No filler. No apologies. Confident but not arrogant.
`;

// ═══════════════════════════════════════════════════════════════
// INTENT-SPECIFIC ADDENDUMS
// Only injected when the specific intent matches — zero token waste.
// ═══════════════════════════════════════════════════════════════

const CODING_ADDENDUM = `
# CODING MODE — ACTIVE
You are now in deep technical mode. Precision is paramount.

## Code Response Rules:
1. **CODE FIRST** — Lead with the complete, runnable code solution. No preamble.
2. **COMPLETE CODE** — Never use "// ..." or "// rest of implementation". Include EVERYTHING.
3. **PRODUCTION QUALITY** — Include: error handling, edge cases, type safety, input validation.
4. **MODERN PATTERNS** — Use current best practices. No deprecated APIs or patterns.
5. **INLINE COMMENTS** — Brief, purposeful comments for non-obvious logic only.
6. **EXPLANATION AFTER** — Below the code: what it does, key decisions, potential gotchas. MAX 3-5 bullet points.
7. **DEBUGGING** — Show fix first, root cause in 1-2 sentences after. Response ENDS there. No follow-up questions. No "next steps".
8. **ARCHITECTURE** — When asked about design: diagram/structure first, then reasoning.
9. **TESTING** — Include test examples when relevant to the question.
10. **NO HOMEWORK** — After code + explanation, STOP. Never append "A good next step is...", "You could also explore...", or follow-up questions about the language/topic.

## Code Quality Checklist:
□ Types/interfaces defined for all data structures
□ Error paths handled (try/catch, null checks, edge cases)
□ No hardcoded values that should be constants
□ No console.log left in (unless it's the point)
□ Imports included at top
□ Works as-is when pasted — no missing dependencies unnamed
`;

const PRODUCT_ADDENDUM = `
# PRODUCT & SHOPPING MODE — ACTIVE
You are providing product recommendations. Use Google Search to find REAL, current data.

## Product Response Format:
1. Present products in a fenced code block with language identifier "products" containing a JSON array.
2. Each product object MUST have: "name", "price" (with currency symbol), "url" (real, working link), "store", "rating" (or omit), "description" (max 80 chars).
3. Include 4-6 products. Vary stores when possible.
4. After the code block: 1-2 sentence recommendation with a clear "best pick" verdict.
5. JSON must be valid. No trailing commas. No comments.

Example format:
\`\`\`products
[{"name":"Sony WH-1000XM5","price":"$348","url":"https://www.amazon.com/dp/B09XS7JWHH","store":"Amazon","rating":"4.7/5","description":"Industry-leading noise cancelling wireless headphones"}]
\`\`\`
`;

const RESEARCH_ADDENDUM = `
# RESEARCH MODE — ACTIVE
You are providing researched, up-to-date information using Google Search grounding.

## Research Response Rules:
1. **FACTS FIRST** — Lead with the most important factual finding.
2. **CITE SOURCES** — Reference where info comes from when Google Search provides it.
3. **CURRENT DATA** — Prioritize the most recent information. Flag if data might be outdated.
4. **MULTIPLE PERSPECTIVES** — For opinions/debates, present the major positions objectively.
5. **NUMBERS & DATA** — Use specific numbers, dates, statistics — never vague approximations.
6. **STRUCTURE** — Use headings to organize multi-faceted research topics.
`;

const REASONING_ADDENDUM = `
# DEEP REASONING MODE — ACTIVE
This query requires careful analytical thinking.

## Reasoning Response Rules:
1. **THESIS** — State your conclusion/answer upfront.
2. **LOGICAL CHAIN** — Show the reasoning path: premise → evidence → conclusion.
3. **CONSIDER ALTERNATIVES** — What's the counterargument? Why is your answer better?
4. **QUANTIFY** — Use numbers, percentages, metrics wherever possible instead of "many" or "some".
5. **EDGE CASES** — What breaks this reasoning? What are the exceptions?
6. **VERDICT** — Clear, decisive final statement. Not wishy-washy.
`;

// ═══════════════════════════════════════════════════════════════
// INTELLIGENT INTENT CLASSIFICATION
// Multi-signal analysis — not just keyword matching.
// ═══════════════════════════════════════════════════════════════

const classifyIntent = (prompt: string, hasImage: boolean, hasDocs: boolean): QueryIntent => {
  const p = prompt.toLowerCase().trim();
  const words = p.split(/\s+/);
  const wordCount = words.length;

  // 1. PRODUCT/SHOPPING — strict signals only (no false positives from "best practices" etc.)
  const productStrongSignals = ['buy', 'purchase', 'shop', 'shopping', 'add to cart', 'order online', 'where to buy', 'cheapest', 'price of', 'cost of', 'worth buying', 'deals on'];
  const productContextSignals = ['amazon', 'flipkart', 'ebay', 'best buy', 'walmart', 'ecommerce', 'e-commerce'];
  const productComparisonSignals = ['vs', 'comparison', 'compare', 'alternative to', 'better than'];
  
  const hasProductStrong = productStrongSignals.some(k => p.includes(k));
  const hasProductContext = productContextSignals.some(k => p.includes(k));
  // "vs" / "comparison" only counts as product if combined with product-ish nouns, not tech/concept comparisons
  const hasProductComparison = productComparisonSignals.some(k => p.includes(k)) && 
    !['react', 'vue', 'angular', 'python', 'java', 'rust', 'go', 'language', 'framework', 'library', 'database', 
      'sql', 'nosql', 'api', 'rest', 'graphql', 'pattern', 'architecture', 'algorithm', 'approach', 'method',
      'strategy', 'technique', 'paradigm', 'protocol', 'linux', 'windows', 'macos'].some(tech => p.includes(tech));

  if (hasProductStrong || hasProductContext || (hasProductComparison && !hasDocs)) {
    return 'live'; // Products need Google Search for real-time data
  }

  // 2. LIVE / REAL-TIME — needs current data from the web
  const liveMarkers = ['weather', 'stock price', 'stock market', 'news today', 'latest news', 'current events',
    'who won', 'score', 'happening now', 'right now', 'breaking', 'trending', 'live score',
    'exchange rate', 'crypto price', 'bitcoin price', 'market cap'];
  const liveContextual = ['today', 'current', 'latest', 'right now', 'this week', 'this month', 'this year',
    'recently', 'just happened', 'status of', 'update on'];
  
  if (liveMarkers.some(k => p.includes(k))) return 'live';
  // "today" etc. only trigger live if combined with factual queries, not "what should I learn today"
  if (liveContextual.some(k => p.includes(k)) && 
      (p.includes('news') || p.includes('price') || p.includes('score') || p.includes('weather') || 
       p.includes('who') || p.includes('what happened') || p.includes('status'))) {
    return 'live';
  }
  if (hasImage) return 'live'; // Images need multimodal + potential search

  // 2.5. COMPARISON — "X vs Y" queries are NOT coding, even if they mention tech terms
  // These need analysis brevity, not 9000-token code-depth responses
  const isComparisonQuery = /\bvs\b|\bversus\b|which (?:should|(?:one|is|are) (?:better|best))|\bcompare\b.*\bfor\b|\bcomparison\b/i.test(p);
  if (isComparisonQuery && !p.includes('```') && !p.includes('fix') && !p.includes('debug') && !p.includes('error')) {
    return 'general'; // Route to general for tight token budget + brevity
  }

  // 3. CODING — technical/programming queries
  const codingStrong = ['function', 'debug', 'error', 'exception', 'stack trace', 'compile', 'runtime',
    'syntax', 'api', 'endpoint', 'database', 'query', 'sql', 'regex', 'algorithm',
    'implement', 'refactor', 'optimize', 'deploy', 'dockerfile', 'kubernetes', 'aws', 'azure',
    'typescript', 'javascript', 'python', 'rust', 'java', 'golang', 'react', 'vue', 'angular',
    'node', 'express', 'django', 'flask', 'spring', 'component', 'middleware', 'webhook',
    'authentication', 'authorization', 'jwt', 'oauth', 'cors', 'graphql', 'rest api',
    'unit test', 'integration test', 'ci/cd', 'pipeline', 'docker', 'nginx', 'webpack', 'vite'];
  const codingContextual = ['code', 'script', 'program', 'build', 'fix', 'repo', 'git', 'commit',
    'branch', 'merge', 'pull request', 'package', 'dependency', 'import', 'module',
    'class', 'method', 'interface', 'type', 'variable', 'array', 'object', 'loop',
    'architecture', 'design pattern', 'microservice', 'monolith', 'serverless'];
  
  if (codingStrong.some(k => p.includes(k)) || p.includes('```')) return 'coding';
  // Contextual coding markers need at least 2 hits or combined with "how to"
  const codingContextHits = codingContextual.filter(k => p.includes(k)).length;
  if (codingContextHits >= 2) return 'coding';
  if (codingContextHits >= 1 && (p.startsWith('how to') || p.startsWith('how do') || p.includes('write a') || p.includes('create a'))) return 'coding';

  // 4. REASONING — complex analytical queries that need deep thinking
  const reasoningMarkers = ['analyze', 'analyse', 'explain why', 'what are the implications',
    'trade-offs', 'tradeoffs', 'pros and cons', 'advantages and disadvantages',
    'should i', 'would it be better', 'what would happen if', 'critique',
    'evaluate', 'assess', 'breakdown', 'deep dive', 'in depth', 'comprehensive',
    'audit', 'review this', 'what are the risks', 'strategy for'];
  if (reasoningMarkers.some(k => p.includes(k))) return 'reasoning';
  
  // 5. RESEARCH — needs factual depth but not necessarily real-time
  const researchMarkers = ['research', 'study', 'paper', 'scientific', 'history of', 'evolution of',
    'how does', 'what causes', 'difference between', 'relationship between', 'impact of',
    'statistics on', 'data on', 'evidence for', 'sources for'];
  if (researchMarkers.some(k => p.includes(k))) return 'research';

  // 6. Complexity heuristic — long, detailed questions likely need reasoning
  if (wordCount > 50 && (p.includes('?') || hasDocs)) return 'reasoning';

  return 'general';
};

// Estimate query complexity (0-1) for temperature/token calibration
const estimateComplexity = (prompt: string, intent: QueryIntent, hasDocs: boolean): number => {
  const wordCount = prompt.split(/\s+/).length;
  let complexity = 0.3; // baseline

  // Length signals
  if (wordCount > 100) complexity += 0.3;
  else if (wordCount > 50) complexity += 0.2;
  else if (wordCount > 20) complexity += 0.1;

  // Intent signals
  const intentWeights: Record<string, number> = { reasoning: 0.3, coding: 0.25, research: 0.2, live: 0.1, general: 0 };
  complexity += intentWeights[intent] || 0;

  // Document analysis adds complexity
  if (hasDocs) complexity += 0.15;

  // Multi-part questions
  const questionMarks = (prompt.match(/\?/g) || []).length;
  if (questionMarks > 1) complexity += 0.1 * Math.min(questionMarks, 3);

  return Math.min(complexity, 1.0);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const routePrompt = (prompt: string, hasImage: boolean = false, hasDocs: boolean = false): RouterResult => {
  const intent = classifyIntent(prompt, hasImage, hasDocs);
  const complexity = estimateComplexity(prompt, intent, hasDocs);
  
  switch (intent) {
    case 'live':
      return { model: AIModel.GEMINI, reason: "Real-Time Intelligence", explanation: "Live web grounding active — fetching current data.", confidence: 1.0, complexity, intent };
    case 'coding':
      return { model: AIModel.CLAUDE, reason: "Technical Precision", explanation: "Deep architecture core — optimized for code quality.", confidence: 0.98, complexity, intent };
    case 'reasoning':
      return { model: AIModel.GPT4, reason: "Deep Analysis", explanation: "Extended reasoning engine — analytical depth maximized.", confidence: 0.96, complexity, intent };
    case 'research':
      return { model: AIModel.GEMINI, reason: "Research & Discovery", explanation: "Research core with web grounding for verified facts.", confidence: 0.95, complexity, intent };
    default:
      return { model: AIModel.GPT4, reason: "Balanced Intelligence", explanation: "Precision synthesis engine — adapting to your query.", confidence: 0.95, complexity, intent };
  }
};

// ═══════════════════════════════════════════════════════════════
// SMART CONTEXT MANAGEMENT
// Prioritized history: recent messages + important context signals.
// ═══════════════════════════════════════════════════════════════

const buildSmartHistory = (history: Message[], intent: QueryIntent): any[] => {
  // Context budget: more history for reasoning/research, less for simple queries
  const historyBudget: Record<string, number> = { reasoning: 10, coding: 8, research: 8, live: 4, general: 6 };
  const maxMessages = historyBudget[intent] || 6;
  const MAX_MSG_LEN = 4000; // Per-message truncation limit

  const recentHistory = history.slice(-maxMessages);
  
  return recentHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{
      text: msg.content.length > MAX_MSG_LEN
        ? msg.content.slice(0, MAX_MSG_LEN) + '\n\n[...message truncated for context efficiency]'
        : msg.content
    }]
  }));
};

// ═══════════════════════════════════════════════════════════════
// SYSTEM INSTRUCTION ASSEMBLER
// Constructs the final system prompt by combining ONLY relevant
// addendums — no token waste on irrelevant instructions.
// ═══════════════════════════════════════════════════════════════

const buildSystemInstruction = (
  intent: QueryIntent, 
  personification: string,
  isProductQuery: boolean
): string => {
  const parts: string[] = [SYSTEM_CORE];

  // Intent-specific addendum — ONLY the relevant one
  switch (intent) {
    case 'coding':
      parts.push(CODING_ADDENDUM);
      break;
    case 'reasoning':
      parts.push(REASONING_ADDENDUM);
      break;
    case 'research':
      parts.push(RESEARCH_ADDENDUM);
      break;
  }

  // Product addendum ONLY when it's actually a product query
  if (isProductQuery) {
    parts.push(PRODUCT_ADDENDUM);
  }

  // Real-time clock context
  const currentDate = new Date();
  parts.push(`
# REAL-TIME CONTEXT
- Date: ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
- Use this for any "today", "now", "current" references.
`);

  // User personification/preferences
  if (personification && personification.trim()) {
    parts.push(`\n# USER PREFERENCE\n${personification}`);
  }

  return parts.join('\n');
};

// ═══════════════════════════════════════════════════════════════
// GENERATION CONFIG — ADAPTIVE PER INTENT + COMPLEXITY
// Tunes temperature, tokens, and thinking based on query needs.
// ═══════════════════════════════════════════════════════════════

const getGenerationConfig = (intent: QueryIntent, complexity: number): { temperature: number; maxTokens: number; useThinking: boolean } => {
  // Temperature: lower = more deterministic, higher = more creative
  const tempMap: Record<string, number> = {
    coding: 0.15,      // Very deterministic for code
    reasoning: 0.3,    // Controlled but allows analytical flexibility
    research: 0.4,     // Some flexibility for synthesis
    live: 0.5,         // Balanced for real-time info
    general: 0.6,      // Natural conversational range
  };

  // Token budget: scales with complexity within intent bounds
  // CRITICAL: Simple queries get HARD LOW ceilings to force brevity
  const baseTokens: Record<string, [number, number]> = {
    coding: [4096, 12288],     // Code can be long
    reasoning: [4096, 10240],  // Analysis needs depth
    research: [3072, 8192],    // Research is thorough
    live: [1024, 4096],        // Live data is focused
    general: [512, 4096],      // General: LOW floor forces brevity on simple queries
  };

  const [minTokens, maxTokens] = baseTokens[intent] || [1024, 4096];
  const tokenBudget = Math.round(minTokens + (maxTokens - minTokens) * complexity);

  // Enable thinking (Pro model) for complex reasoning/coding
  const useThinking = (intent === 'reasoning' || intent === 'coding') && complexity > 0.6;

  return {
    temperature: tempMap[intent] || 0.5,
    maxTokens: tokenBudget,
    useThinking,
  };
};

// ═══════════════════════════════════════════════════════════════
// OUTPUT POST-PROCESSING
// Cleans, validates, and enhances AI responses for consistency.
// ═══════════════════════════════════════════════════════════════

const postProcessResponse = (rawText: string, intent: QueryIntent): string => {
  let text = rawText.trim();

  // ── PHASE 1: Strip filler openers (comprehensive list) ──
  // Run multiple passes to catch layered fillers like "Sure! Of course, here's..."
  for (let pass = 0; pass < 3; pass++) {
    const prevText = text;
    const fillerPatterns = [
      // Direct filler words at the start
      /^(Sure!?|Absolutely!?|Certainly!?|Of course!?|Great question!?|That's a great question!?|Happy to help!?|No problem!?|I'd be happy to help!?|Glad you asked!?|Good question!?)\s*/i,
      // Soft filler openers
      /^(Okay,?\s*(?:so\s*)?|Alright,?\s*(?:so\s*)?|Well,?\s*|So,?\s*|Right,?\s*)/i,
      // "Here is/are" patterns
      /^(Here(?:'s| is| are)\s+(?:a |the |my |an |some )?(?:(?:few|couple|several|some|brief|quick|comprehensive|detailed)\s+)?(?:options?|ways?|approaches?|suggestions?|ideas?|examples?|thoughts?|things?|points?|steps?|methods?).*?[:.!]\s*)/i,
      // "Let me" patterns
      /^(Let me (?:explain|walk you through|break (?:this|it) down|help|show|provide|give).*?[:.!]\s*)/i,
      // "I'll" patterns
      /^(I'll (?:explain|show|walk|break|help|provide|give|cover).*?[:.!]\s*)/i,
      // "That's" praise patterns
      /^(That's (?:a |an )?(?:great|good|excellent|interesting|important|valid|fair).*?[.!]\s*)/i,
      // "I understand" / "I see" patterns
      /^(I (?:understand|see|get it).*?[.!]\s*)/i,
    ];
    for (const pattern of fillerPatterns) {
      text = text.replace(pattern, '');
    }
    if (text === prevText) break; // No more fillers found
  }

  // ── PHASE 2: Strip filler closings ──
  const closingFillers = [
    /\n*(Hope this helps!?|Let me know if you (?:have|need) (?:any|more).*|Feel free to (?:ask|reach|let).*|Happy to help.*|I hope that (?:helps|answers).*|Don't hesitate to.*|If you (?:have|need) (?:any|more).*|Is there anything else.*|Would you like me to.*|Shall I.*|Want me to.*)\s*$/i,
    // Strip "next step" / homework suggestions
    /\n*(?:A (?:good |great |useful )?next step (?:is |would be |could be ).*|You (?:could|might|may|can) (?:also |want to )?(?:explore|try|look into|consider|experiment|check out|investigate).*|(?:As )?(?:a |an )?(?:further|additional|next) (?:step|exercise|exploration).*|(?:Consider|Try) (?:exploring|looking into|experimenting).*)\.?\s*$/i,
  ];
  for (const pattern of closingFillers) {
    text = text.replace(pattern, '');
  }

  // ── PHASE 2.5: Strip trailing unsolicited follow-up questions ──
  // The model sometimes appends questions at the end in various formats:
  // Plain text, bullet lists, numbered lists, after code blocks, etc.
  // Pass 1: Strip trailing question blocks (plain paragraph style)
  text = text.replace(/\n+(?:(?:What|How|Could|Would|Can|Are there|Is there|Do you|Should|Why|Where|When|Which|Have you)[^\n]*\?\s*\n?){1,5}\s*$/i, '');
  // Pass 2: Strip trailing bullet/numbered-list questions
  text = text.replace(/\n+(?:\s*[-*•]\s*(?:What|How|Could|Would|Can|Are there|Is there|Do you|Should|Why|Where|When|Which|Have you)[^\n]*\?\s*\n?){1,5}\s*$/i, '');
  text = text.replace(/\n+(?:\s*\d+\.\s*(?:What|How|Could|Would|Can|Are there|Is there|Do you|Should|Why|Where|When|Which|Have you)[^\n]*\?\s*\n?){1,5}\s*$/i, '');
  // Pass 3: Strip a single trailing question line (any format)
  text = text.replace(/\n+(?:[-*•]\s*)?(?:What|How|Could|Would|Can|Are there|Is there|Do you|Should|Why|Where|When|Which|Have you)[^\n]*\?\s*$/i, '');
  // Pass 4: Catch questions that start with other patterns ("Is X...", "Does...", "Will...", "Did...")
  text = text.replace(/\n+(?:[-*•]\s*|\d+\.\s*)?(?:Is |Does |Will |Did |Won't |Doesn't |Isn't |Aren't |Wasn't |Weren't )[^\n]*\?\s*$/i, '');
  // Pass 5: Final aggressive sweep — any line ending with ? at the very end, preceded by blank line
  text = text.replace(/\n{2,}[^\n]*\?\s*$/i, '');

  // ── PHASE 3: Ensure code blocks have language identifiers ──
  text = text.replace(/```\n/g, '```text\n');

  // ── PHASE 4: Clean up excessive whitespace ──
  text = text.replace(/\n{4,}/g, '\n\n\n');

  // ── PHASE 5: Capitalize first character ──
  if (text.length > 0 && /[a-z]/.test(text[0])) {
    text = text[0].toUpperCase() + text.slice(1);
  }

  // ── PHASE 6: Trim trailing "---" separators ──
  text = text.replace(/\n---\s*$/g, '');

  // ── PHASE 7: Strip non-English character contamination ──
  // Occasionally the model leaks words in Russian, Chinese, etc. into English responses.
  // Remove any runs of Cyrillic, CJK, Arabic, Devanagari, etc. that appear mid-English text.
  // Preserve common accented Latin chars (é, ñ, ü) and symbols/emoji.
  text = text.replace(/[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]+/g, ''); // Cyrillic
  text = text.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]+/g, ''); // CJK
  text = text.replace(/[\u0600-\u06FF\u0750-\u077F]+/g, ''); // Arabic
  text = text.replace(/[\u0900-\u097F]+/g, ''); // Devanagari
  // Clean up any resulting double spaces or orphaned punctuation
  text = text.replace(/  +/g, ' ');
  text = text.replace(/ \./g, '.');
  text = text.replace(/ ,/g, ',');

  return text.trim();
};

// ═══════════════════════════════════════════════════════════════
// MAIN AI RESPONSE FUNCTION — THE CORE ENGINE
// ═══════════════════════════════════════════════════════════════

export const getAIResponse = async (
  prompt: string, 
  history: Message[], 
  manualModel?: AIModel | 'auto',
  onRouting?: (result: RouterResult) => void,
  image?: MessageImage,
  documents: AttachedDocument[] = [],
  personification: string = "",
  onStreamChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<{ content: string; model: AIModel; tokens: number; inputTokens: number; outputTokens: number; groundingChunks?: GroundingChunk[]; routingContext: any }> => {
  
  // Concurrency guard
  if (isRequestPending) {
    await sleep(300);
    if (isRequestPending) isRequestPending = false;
  }
  
  const now = Date.now();
  if (now - lastRequestTimestamp < MIN_REQUEST_GAP) {
    await sleep(MIN_REQUEST_GAP - (now - lastRequestTimestamp));
  }

  isRequestPending = true;
  lastRequestTimestamp = Date.now();

  // Route the query
  const routing = (manualModel && manualModel !== 'auto') 
    ? { model: manualModel, reason: "Manual Override", explanation: `Direct routing to ${manualModel}.`, confidence: 1.0, complexity: estimateComplexity(prompt, classifyIntent(prompt, !!image, documents.length > 0), documents.length > 0), intent: classifyIntent(prompt, !!image, documents.length > 0) }
    : routePrompt(prompt, !!image, documents.length > 0);

  if (onRouting) onRouting(routing);

  // Select model: PRO for complex coding/reasoning, FLASH for everything else
  const useProModel = (routing.intent === 'coding' && routing.complexity > 0.5) || 
                      (routing.intent === 'reasoning' && routing.complexity > 0.6);
  const targetEngine = useProModel ? CORE_MODELS.PRO : CORE_MODELS.FLASH;

  // Detect if this is specifically a product query (for conditional addendum)
  const isProductQuery = (() => {
    const p = prompt.toLowerCase();
    const productSignals = ['buy', 'purchase', 'shop', 'shopping', 'add to cart', 'order online', 
      'where to buy', 'cheapest', 'price of', 'cost of', 'worth buying', 'deals on',
      'amazon', 'flipkart', 'ebay', 'best buy', 'walmart', 'ecommerce', 'e-commerce'];
    return productSignals.some(k => p.includes(k));
  })();

  // Build the system instruction — only relevant addendums
  const systemInstruction = buildSystemInstruction(routing.intent, personification, isProductQuery);

  // Get adaptive generation config
  const genConfig = getGenerationConfig(routing.intent, routing.complexity);

  // Retry with exponential backoff
  const MAX_RETRIES = 4;
  let lastError: any = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      if (!apiKey) throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment.');
      const ai = new GoogleGenAI({ apiKey });
      
      // Build smart conversation history
      const contents = buildSmartHistory(history, routing.intent);
      
      // Build current message parts
      const currentParts: any[] = [];
      if (documents.length > 0) {
        documents.forEach(doc => currentParts.push({ text: `[ATTACHED DOCUMENT: ${doc.title}]\n\`\`\`\n${doc.content}\n\`\`\`\n` }));
      }
      if (image) currentParts.push({ inlineData: { data: image.inlineData.data, mimeType: image.mimeType } });
      currentParts.push({ text: prompt });
      contents.push({ role: 'user', parts: currentParts });

      // Tools — Google Search for live/research/product intents
      const tools: any[] = [];
      if (routing.intent === 'live' || routing.intent === 'research' || isProductQuery) {
        tools.push({ googleSearch: {} });
      }

      let fullText = "";
      let usage: any = { totalTokenCount: 0, promptTokenCount: 0, candidatesTokenCount: 0 };
      let groundingChunks: GroundingChunk[] = [];

      const modelConfig: any = {
        systemInstruction,
        temperature: genConfig.temperature,
        maxOutputTokens: genConfig.maxTokens,
        tools: tools.length > 0 ? tools : undefined,
      };

      // Enable thinking for complex queries on Pro model
      if (genConfig.useThinking && targetEngine === CORE_MODELS.PRO) {
        modelConfig.thinkingConfig = { thinkingBudget: Math.min(Math.round(genConfig.maxTokens * 0.4), 4096) };
      }

      if (onStreamChunk) {
        const result = await ai.models.generateContentStream({
          model: targetEngine,
          contents,
          config: modelConfig,
        });

        for await (const chunk of result) {
          if (signal?.aborted) break;
          const text = chunk.text || "";
          fullText += text;
          onStreamChunk(text);
          if (chunk.usageMetadata) usage = chunk.usageMetadata;
          const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks) {
            for (const c of chunks as GroundingChunk[]) groundingChunks.push(c);
          }
        }
      } else {
        const response = await ai.models.generateContent({
          model: targetEngine,
          contents,
          config: modelConfig,
        });
        fullText = response.text || "";
        usage = response.usageMetadata || usage;
        groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
      }

      // Post-process the response for quality consistency
      const processedText = postProcessResponse(fullText, routing.intent);

      isRequestPending = false;
      return { 
        content: processedText, 
        model: routing.model, 
        tokens: usage.totalTokenCount,
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        groundingChunks: groundingChunks.length > 0 ? groundingChunks : undefined,
        routingContext: { ...routing, engine: targetEngine, thinking: genConfig.useThinking }
      };
    } catch (err: any) {
      lastError = err;
      const msg = (err.message || "").toLowerCase();
      
      if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted') || msg.includes('rate limit') || msg.includes('503') || msg.includes('unavailable') || msg.includes('overloaded') || msg.includes('load failed') || msg.includes('failed to fetch') || msg.includes('network')) {
        if (attempt < MAX_RETRIES - 1) {
          const backoffMs = Math.min(1500 * Math.pow(2, attempt), 20000);
          console.warn(`API error (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${backoffMs}ms...`);
          isRequestPending = false;
          await sleep(backoffMs);
          isRequestPending = true;
          lastRequestTimestamp = Date.now();
          continue;
        }
        isRequestPending = false;
        logError(msg, true, routing.model);
        throw new Error("API temporarily overloaded. Please wait a few seconds and try again.");
      }
      
      isRequestPending = false;
      logError(msg, true, routing.model);
      throw err;
    }
  }

  isRequestPending = false;
  throw lastError;
};

export const generateFollowUpSuggestions = async (lastMsg: string, intent: QueryIntent): Promise<string[]> => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return [];
    const ai = new GoogleGenAI({ apiKey });
    const trimmed = lastMsg.length > 800 ? lastMsg.substring(0, 800) : lastMsg;
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Suggest 3 brief follow-up questions for: "${trimmed}". Return JSON array of strings.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }, maxOutputTokens: 256 }
    });
    return JSON.parse(response.text || "[]").slice(0, 3);
  } catch (err) { return []; }
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return 'New Session';
    const ai = new GoogleGenAI({ apiKey });
    const trimmed = firstMessage.length > 1000 ? firstMessage.substring(0, 1000) : firstMessage;
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Summarize the following first message into a professional, concise 3 to 5 word title for a chat conversation: "${trimmed}". Return ONLY the title text. Do not use quotes or periods.`,
    });
    return response.text?.trim().replace(/['"]/g, '').replace(/\.$/, '') || "New Session";
  } catch (err) { return "New Session"; }
};

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}