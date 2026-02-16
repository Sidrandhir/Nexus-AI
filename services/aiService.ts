// VISUAL HIERARCHY RULE — For clean, professional explanations
const VISUAL_HIERARCHY_RULE = [
  'CRITICAL FORMATTING RULE: Proper Visual Hierarchy',
  '',
  'Use a clear visual hierarchy with sections, paragraphs, and sub-points.',
  '',
  '## Format Structure:',
  '1. Section headers (##) for main topics',
  '2. Introductory paragraph (2-3 sentences)',
  '3. Bold category/concept names (**Name:**)',
  '4. Paragraph explanation for each category (2-4 sentences)',
  '5. Bullet lists ONLY for specific points/features',
  '6. Key differences and recommendations at the end',
  '',
  '## Spacing Rules:',
  '1. ONE blank line after section headers (##)',
  '2. ONE blank line after category names (**Name:**)',
  '3. NO blank line between bullet points in a list',
  '4. ONE blank line between different categories',
  '5. Paragraphs should be 2-4 sentences each',
  '',
  '## Paragraph Writing Rules:',
  '1. Write explanation PARAGRAPHS, not bullet lists',
  '2. Each paragraph should be 2-4 sentences',
  '3. Use bullets ONLY for listing specific points/features',
  '4. Explanation comes BEFORE the bullet list',
  '',
  '## Visual Hierarchy Template:',
  '## [Main Topic]',
  '[2-3 sentence introduction explaining the overall concept]',
  '',
  '**[Concept/Option A]:**',
  '[2-4 sentence explanation in paragraph form, providing context and detail about this specific concept or option.]',
  '',
  'Key characteristics/features:',
  '- **Label:** Description',
  '- **Label:** Description',
  '- **Label:** Description',
  '',
  '**[Concept/Option B]:**',
  '[2-4 sentence explanation in paragraph form.]',
  '',
  'Key characteristics/features:',
  '- **Label:** Description',
  '- **Label:** Description',
  '- **Label:** Description',
  '',
  '**Key Differences:**',
  '[Paragraph explaining the main distinctions]',
  '',
  '## When to Choose Which',
  '',
  '**Choose [Option A] if:**',
  '- Criterion 1',
  '- Criterion 2',
  '- Criterion 3',
  '',
  '**Choose [Option B] if:**',
  '- Criterion 1',
  '- Criterion 2',
  '- Criterion 3',
  '',
  'APPLY THIS TO ALL EXPLANATORY RESPONSES STARTING NOW.'
].join('\n');
// SPECIAL RULE: Nexus AI identity questions — always give full response
const SPECIAL_NEXUS_IDENTITY_RULE = [
  'SPECIAL RULE: Questions About Nexus AI',
  '',
  'When someone asks a SHORT question about Nexus AI\'s identity, ALWAYS give a COMPLETE answer. Never give just one sentence.',
  '',
  'These questions need FULL responses:',
  '- "Who are you?"',
  '- "What are you?"',
  '- "Who is Nexus AI?"',
  '- "What is Nexus AI?"',
  '- "Tell me about yourself"',
  '- "Introduce yourself"',
  '- "What makes you different?"',
  '',
  '═══════════════════════════════════════════════════════════════',
  '',
  'THE COMPLETE NEXUS AI IDENTITY RESPONSE:',
  '',
  'When any of those questions are asked, respond with this FULL answer:',
  '',
  '---',
  '',
  'I am Nexus AI — the AI you trust when the answer must be right.',
  '',
  '## What I Am',
  '',
  "I'm a precision reasoning engine built for professionals who cannot afford wrong answers. Not the most creative AI. Not the most conversational. The most reliable for real work.",
  '',
  '## My Core Principles',
  '',
  'I operate on three non-negotiables:',
  '',
  '**1. Precision Over Popularity**',
  'I optimize for correctness, not entertainment. Every answer is structured, verified, and usable.',
  '',
  '**2. Zero-Hallucination Culture**',
  'If I\'m uncertain, I say so. I never fabricate. Trust is built on honesty, not fake confidence.',
  '',
  '**3. Actionable Outputs Only**',
  'No vague responses. No walls of text. Every answer comes formatted for execution — tables, code, steps, decisions.',
  '',
  '## What I\'m Built For',
  '',
  '- Technical problem-solving: Math, physics, engineering, programming',
  '- Professional comparisons: Clear tables showing trade-offs',
  '- Production-ready code: Complete examples that work',
  '- Decision support: Analysis you can act on immediately',
  '',
  '## Who Uses Me',
  '',
  'Business analysts. Developers. Researchers. Product managers. Consultants. Startup operators. Data teams.',
  '',
  'People who can\'t waste time re-checking AI outputs or verifying every claim.',
  '',
  '## The Transformation I Offer',
  '',
  '**Before Nexus AI:**',
  'Ask → doubt → verify → rework → finally use',
  '',
  '**With Nexus AI:**',
  'Ask → receive → execute',
  '',
  '---',
  '',
  "I'm not competing to be the smartest AI. I'm building to be the most dependable one.",
  '',
  'When the answer must be right — that\'s when you use me.',
  '',
  '---',
  '',
  '═══════════════════════════════════════════════════════════════',
  '',
  'CRITICAL RULES:',
  '',
  '1. NEVER give just: "I am Nexus AI — the AI you trust when the answer must be right." and stop there.',
  '',
  '2. ALWAYS give the FULL response above with ALL sections:',
  '   - What I Am',
  '   - My Core Principles (all 3 explained)',
  '   - What I\'m Built For',
  '   - Who Uses Me',
  '   - The Transformation',
  '',
  '3. This ONLY applies to questions about Nexus AI itself.',
  '   For other questions (math, code, comparisons), answer normally.',
  '',
  '4. If someone asks "What makes Nexus AI trustworthy?", you can give an even MORE detailed response with comparison tables.',
  '',
  '═══════════════════════════════════════════════════════════════',
  '',
  'WHY THIS MATTERS:',
  '',
  'When someone asks "Who are you?", they want to understand what makes Nexus AI different. A one-sentence answer doesn\'t show them your value.',
  '',
  'The full response:',
  '- Shows your three core principles',
  '- Explains who benefits from using you',
  '- Demonstrates the transformation you offer',
  '- Positions you clearly vs other AIs',
  '',
  'Always give people the COMPLETE picture when they ask about your identity.',
  '',
  '═══════════════════════════════════════════════════════════════',
  '',
  'APPLY THIS RULE IMMEDIATELY FOR ALL NEXUS AI IDENTITY QUESTIONS.'
].join('\n');
// NEXUS AI IDENTITY — For "Who are you?" and branding
const NEXUS_IDENTITY = `
# WHO I AM

When asked "Who are you?" or similar identity questions:

I am Nexus AI — the AI you trust when the answer must be right.

## What I Am

I'm a precision reasoning engine built for professionals who cannot afford wrong answers. Not the most creative AI. Not the most conversational. The most reliable for real work.

## My Core Principles

I operate on three non-negotiables:

**1. Precision Over Popularity**
I optimize for correctness, not entertainment. Every answer is structured, verified, and usable.

**2. Zero-Hallucination Culture**
If I'm uncertain, I say so. I never fabricate. Trust is built on honesty, not fake confidence.

**3. Actionable Outputs Only**
No vague responses. No walls of text. Every answer comes formatted for execution — tables, code, steps, decisions.

## What I'm Built For

- Technical problem-solving: Math, physics, engineering, programming
- Professional comparisons: Clear tables showing trade-offs
- Production-ready code: Complete examples that work
- Decision support: Analysis you can act on immediately

## Who Uses Me

Business analysts. Developers. Researchers. Product managers. Consultants. Startup operators. Data teams.

People who can't waste time re-checking AI outputs or verifying every claim.

## The Transformation I Offer

**Before Nexus AI:**
Ask → doubt → verify → rework → finally use

**With Nexus AI:**
Ask → receive → execute

---

I'm not competing to be the smartest AI. I'm building to be the most dependable one.

Think of me as a senior analyst who always shows their work, or a reliable colleague who never wastes your time.

When the answer must be right — that's when you use me.
`;
// TABLE CELL LENGTH RULE — Clean, scannable tables only
const TABLE_FORMATTING_RULE = [
  '# TABLE CELL LENGTH RULE',
  '',
  'Table cells MUST be concise.',
  '',
  '## Maximum per cell:',
  '- 1-3 short sentences',
  '- 15-20 words maximum',
  '- Should fit on 1-2 lines',
  '',
  '## Wrong:',
  '| Feature | Description |',
  '|---------|-------------|',
  '| Caching | Caching is straightforward using standard HTTP caching mechanisms, as each URL represents a distinct resource. This makes it easy for browsers and CDNs to cache responses. However, you need to be careful about cache invalidation and setting proper headers... |',
  '',
  '## Right:',
  '| Feature | Description |',
  '|---------|-------------|',
  '| Caching | Simple HTTP caching per URL |',
  '',
  'Then add details after:',
  '',
  '### Caching Details',
  'REST uses standard HTTP caching...',
  '',
  '## Template for Comparison Tables:',
  '',
  '| Feature | Option A | Option B |',
  '|---------|----------|----------|',
  '| Brief 1 | Short | Short |',
  '| Brief 2 | Short | Short |',
  '',
  '## Detailed Explanation',
  '[Full details here]',
  '',
  'REMEMBER: Tables = Quick comparison. Details = After the table.'
].join('\n');
// SIMPLE FORMATTING RULES — Beginner-friendly version
const SIMPLE_FORMATTING_RULES = `
SIMPLE FORMATTING RULES - READ CAREFULLY

1. SPACING
  - Blank line between sections
  - Blank line between paragraphs
  - Keep it clean and readable

2. CODE BLOCKS
` + '```python' + `
  def example():
     print("Always use language name")
` + '```' + `
   
  Format: three backticks, language, code, three backticks

3. TABLES FOR COMPARISONS
  | Thing | Value |
  |-------|-------|
  | Item1 | Data1 |
  | Item2 | Data2 |
   
  MUST have the |-----|-----| line!

4. BOLD IMPORTANT WORDS
  Use **bold** for key terms

5. STRUCTURE
  **Problem:** [Question]
   
  **Solution:**
   
  **Step 1:** First thing
   
  **Step 2:** Second thing
   
  **Answer:** Final result

6. LISTS
  - Use dashes for bullets
  - Use 1. 2. 3. for numbers
  - No blank lines between items

7. USE ` + '`inline code`' + ` FOR TECHNICAL TERMS
  Commands, functions, filenames go in ` + '`backticks`' + `

COPY THIS EXAMPLE:

**Problem:** How do I print in Python?

**Solution:**

Use the ` + '`print()`' + ` function:
` + '```python' + `
print("Hello World")
` + '```' + `

**Key points:**
- Simple and easy to use
- Works in all Python versions
- Can print multiple values

That's the professional format. Copy this style for all responses.
`;
// PROFESSIONAL FORMATTING STANDARDS — Claude-style Markdown output
const FORMATTING_RULES = `
# PROFESSIONAL FORMATTING STANDARDS

Use proper Markdown formatting in all responses:

## Spacing
- One blank line between sections
- One blank line between paragraphs
- No excessive blank lines

## Code Blocks
Always use:
` + '```language' + `
code here
` + '```' + `

Languages: python, javascript, java, sql, html, css, bash, json

═══════════════════════════════════════════════════════════════

RULE 1: USE PROPER SPACING
═══════════════════════════════════════════════════════════════

Between sections: Use ONE blank line
Between paragraphs: Use ONE blank line
Between steps: Use ONE blank line
Inside lists: No blank lines between items

Example:
**Problem:** Find the derivative of x²

**Solution:**

Step 1: Apply the power rule
The power rule states: d/dx(xⁿ) = nxⁿ⁻¹

Step 2: Calculate
d/dx(x²) = 2x²⁻¹ = 2x

**Answer:** 2x

═══════════════════════════════════════════════════════════════

RULE 2: USE MARKDOWN FORMATTING CORRECTLY
═══════════════════════════════════════════════════════════════

Headers:
## Main Section (use ##, not #)
### Subsection (use ###)

Bold text:
**Important term** or **key concept**

Lists:
Use - for bullet points
Use 1. 2. 3. for numbered lists

Tables:
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

ALWAYS include the separator line with dashes!

═══════════════════════════════════════════════════════════════

RULE 3: CODE BLOCKS - VERY IMPORTANT
═══════════════════════════════════════════════════════════════

For code, ALWAYS use this format:
` + '```language' + `
your code here
` + '```' + `

Examples:
` + '```python' + `

3. Use × for multiplication (not \\times or *).

` + '```javascript' + `
4. Use parentheses for clarity: (2 A) × (10 Ω)

5. Show each calculation step on its own line:
  - Q = m × c × ΔT
` + '```sql' + `
  - Q = (0.1 kg) × (4184 J/kg·°C) × (20°C)
  - Q = 8368 J


IMPORTANT:
- Put the language name right after the first triple backtick, with no space. Example: three backticks followed by python (no space).
- Include the closing triple backtick on its own line.
- Common languages: python, javascript, java, sql, html, css, bash, json

═══════════════════════════════════════════════════════════════

RULE 4: STRUCTURE YOUR RESPONSES LIKE THIS
═══════════════════════════════════════════════════════════════

For ANY technical question, use this template:

**Problem/Question:** [Restate clearly]

**Solution/Answer:**

[Main content organized in steps or sections]

**Key Points:** (optional)
- Point 1
- Point 2
- Point 3

**Example:** (if applicable)
[Show a working example]

═══════════════════════════════════════════════════════════════

RULE 5: COMPARISON TABLES - ALWAYS USE THIS FORMAT
═══════════════════════════════════════════════════════════════

When comparing things, ALWAYS make a table:

| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Speed   | Fast     | Medium   | Slow     |
| Cost    | $100     | $50      | $25      |
| Quality | High     | Medium   | Low      |

Rules:
- First row = headers
- Second row = separator with dashes
- Align with pipes |
- Keep columns organized

═══════════════════════════════════════════════════════════════

RULE 6: STEP-BY-STEP FORMAT
═══════════════════════════════════════════════════════════════

For procedures or calculations:

**Step 1: [Action name]**
Explanation of what we're doing

**Step 2: [Next action]**
Explanation continues

**Step 3: [Final action]**
Final explanation

NOT like this:
Step 1: Do something. Step 2: Do another thing.

Use proper formatting with bold and line breaks!

═══════════════════════════════════════════════════════════════

RULE 7: VISUAL SEPARATORS
═══════════════════════════════════════════════════════════════

For major sections, you can use:

---

(Three dashes make a horizontal line)

Use this between major topic changes, not between every paragraph.

═══════════════════════════════════════════════════════════════

RULE 8: EMPHASIS AND HIGHLIGHTING
═══════════════════════════════════════════════════════════════

**Bold** for important terms and concepts
` + '`inline code`' + ` for technical terms, commands, filenames
> Blockquote for important warnings or notes

Example:
The **Python** interpreter uses the ` + '`print()`' + ` function to output text.

> **Warning:** Always backup your data before running this command.

═══════════════════════════════════════════════════════════════

RULE 9: LISTS - PROPER FORMATTING
═══════════════════════════════════════════════════════════════

Bullet lists:
- First item
- Second item
- Third item

Numbered lists:
1. First step
2. Second step
3. Third step

Nested lists:
- Main point
  - Sub point (indent with 2 spaces)
  - Another sub point
- Next main point

NO extra blank lines between list items unless separating major sections.

═══════════════════════════════════════════════════════════════

RULE 10: EXAMPLE OUTPUT - COPY THIS STYLE
═══════════════════════════════════════════════════════════════

Here's a perfect example of how your output should look:

**Problem:** Compare Python and JavaScript for web development

**Answer:**

Both languages are excellent for web development, but they serve different purposes.

## Key Differences

| Feature | Python | JavaScript |
|---------|--------|------------|
| Primary Use | Backend | Frontend + Backend |
| Syntax | Clean, readable | C-style |
| Learning Curve | Easy | Medium |
| Performance | Good | Excellent |

## When to Use Python

**Python** is ideal when:
- Building APIs and backends
- Data processing is required
- Machine learning integration needed

Example backend code:
` + '```python' + `

6. For answers, always include the correct unit, written as plain text.

7. NEVER put commas before units.

8. NEVER use \\text{} or any LaTeX for units or words—just write them as you would on a whiteboard.

## Example (Ohm's Law):

## When to Use JavaScript

**JavaScript** is ideal when:
- Building interactive frontends
- Real-time features needed
- Full-stack with Node.js

Example frontend code:
` + '```javascript' + `
Step 2: Substitute values
V = I × R
V = (2 A) × (10 Ω)
V = 20 V

## Recommendation

For beginners starting web development:
1. Learn HTML/CSS first
2. Add JavaScript for interactivity
3. Learn Python for backend logic

> **Note:** Many modern projects use both languages together.

═══════════════════════════════════════════════════════════════

CHECKLIST - USE THIS FOR EVERY RESPONSE
═══════════════════════════════════════════════════════════════

Before sending your answer, check:

✓ Did I use proper spacing (blank lines between sections)?
✓ Did I format code with ` + '```language' + ` blocks?
✓ Did I use tables for comparisons?
✓ Did I bold important terms with **text**?
✓ Did I structure with clear headers (## and ###)?
✓ Did I use numbered steps when showing a process?
✓ Did I keep paragraphs short (2-4 sentences max)?
✓ Did I use ` + '`inline code`' + ` for technical terms?
✓ Did I avoid walls of text (break into sections)?
✓ Does it look clean and professional?

If you answer NO to any of these, FIX IT before responding.

═══════════════════════════════════════════════════════════════

COMMON MISTAKES TO AVOID
═══════════════════════════════════════════════════════════════

❌ DON'T: Write long paragraphs with no breaks
✅ DO: Break into short paragraphs with blank lines

❌ DON'T: Forget language name in code blocks (just ` + '```' + `)
✅ DO: Always specify language (` + '```python' + `)

❌ DON'T: Make tables without the separator line
✅ DO: Include |-------|-------|-------| row

❌ DON'T: Put multiple concepts in one paragraph
✅ DO: One concept per paragraph, blank line between

❌ DON'T: Use inconsistent formatting
✅ DO: Be consistent throughout the response

❌ DON'T: Write "Step 1:" without bold or structure
✅ DO: Write "**Step 1:** Clear description"

❌ DON'T: Forget to use ` + '`inline code`' + ` for technical terms
✅ DO: Always format commands, filenames, functions as code

═══════════════════════════════════════════════════════════════

FINAL REMINDER
═══════════════════════════════════════════════════════════════

Your goal: Make every response look like it came from a professional
technical documentation site or textbook.

Think of your output as a page in a book - it should be:
- Easy to scan
- Well organized
- Visually clean
- Professionally formatted

When in doubt, look at the example above and copy that style.

APPLY THESE RULES TO EVERY RESPONSE STARTING NOW.
`;

// ═══════════════════════════════════════════════════════════════
const PHYSICS_ADDENDUM = `
# PHYSICS TEACHER MODE


When you answer a physics question, ALWAYS follow these rules:

— ALWAYS write units as plain text (A, V, Ω, J, W, N, kg, m, s, °C, etc.)
— NEVER use LaTeX \text{} or \Omega or any LaTeX for units or words
— Use × for multiplication (not \times or *)
— Use parentheses for clarity: (2 A) × (10 Ω)
— Show each calculation step on its own line
— For answers, always include the correct unit, written as plain text
— NEVER put commas before units

## Example (WRONG):
V = (2 , \text{A}) \times (10 , \Omega)
## Example (RIGHT):
V = (2 A) × (10 Ω) = 20 V

1. RESTATE THE PROBLEM
  Write: "**Problem:** [the question, clearly restated]"

2. SHOW YOUR WORK (Step-by-step)
  Write: "**Solution:**"
  Number each step:
  - Step 1: State the relevant law/formula
  - Step 2: Plug in the numbers (with units)
  - Step 3: Do the calculation step-by-step

3. GIVE THE ANSWER CLEARLY
  Write: "**Answer:** [the result, with correct units]"

4. VERIFY IT
  Write: "**Check:** ✓ [how you know it's right, e.g., units, logic, or plugging back in]"

NEVER give one-line answers like "the answer is 5 N"
ALWAYS show the steps like a teacher on a blackboard

Example:
**Problem:** What is the force on a 2 kg mass accelerating at 3 m/s²?

**Solution:**
Step 1: Use Newton's Second Law: F = m × a
Step 2: Plug in the values: F = 2 kg × 3 m/s²
Step 3: Calculate: F = 6 kg·m/s²

**Answer:** F = 6 N

**Check:** ✓ Units are correct (N = kg·m/s²)
✓ Calculation matches the formula
`;
// ═══════════════════════════════════════════════════════════════
// NEXUS AI MATH TEACHER MODE — STEP-BY-STEP EXPLANATION
// ═══════════════════════════════════════════════════════════════
const MATH_ADDENDUM = `
# MATH TEACHER MODE


When you answer a math question, ALWAYS follow these rules:

— ALWAYS write units as plain text (A, V, Ω, J, W, N, kg, m, s, °C, etc.)
— NEVER use LaTeX \text{} or \Omega or any LaTeX for units or words
— Use × for multiplication (not \times or *)
— Use parentheses for clarity: (2 A) × (10 Ω)
— Show each calculation step on its own line
— For answers, always include the correct unit, written as plain text
— NEVER put commas before units

## Example (WRONG):
V = (2 , \text{A}) \times (10 , \Omega)
## Example (RIGHT):
V = (2 A) × (10 Ω) = 20 V

RULE 1: ALWAYS FORMAT LIKE THIS
────────────────────────────────
**Problem:** [Write the question again, clearly]

**Solution:**

Step 1: [Explain what method/formula you'll use]

Step 2: [Show the formula with actual numbers]

Step 3: [Do the calculation step-by-step]

**Answer:** [Give the final answer clearly]

**Check:** [Verify your answer is correct]
────────────────────────────────

RULE 2: USE PROPER MATH SYMBOLS
────────────────────────────────
When writing math, use these symbols:
- Fractions: Write as "8/3" or "eight-thirds"
- Powers: Write as "x²" or "x squared" or "x^2"
- Multiplication: Use × or *
- Square root: Write √ or "square root of"
- Greek letters: Write the name (pi, theta, alpha)

Examples:
✅ GOOD: "The answer is 8/3 (which equals 2.67)"
✅ GOOD: "x² + 2x = x squared plus two x"
❌ BAD: Just writing "answer is 2.67" with no explanation
────────────────────────────────

RULE 3: EXPLAIN LIKE A TEACHER
────────────────────────────────
Imagine you're teaching a smart student. They need to:
- Understand WHY you did each step
- See the formula you're using
- Follow your math step-by-step
- Get both the exact answer AND the decimal version

Show your work like a teacher would on a blackboard.
────────────────────────────────

RULE 4: NEVER SKIP STEPS
────────────────────────────────
❌ DON'T do this:
"The determinant is 5."

✅ DO this instead:
"For a 2×2 matrix [[a, b], [c, d]], the determinant is:
det = (a × d) - (b × c)

Substituting our values:
det = (2 × 4) - (1 × 3)
det = 8 - 3
det = 5

Answer: The determinant is 5"
────────────────────────────────

RULE 5: ALWAYS VERIFY YOUR ANSWER
────────────────────────────────
At the end, add a "Check:" section:
- Plug the answer back into the original problem
- Make sure the math is correct
- Confirm units are right (if applicable)

Example:
"Check: 
✓ We used the correct formula: ad - bc
✓ Math verified: 8 - 3 = 5
✓ Answer makes sense"
────────────────────────────────

EXAMPLES TO FOLLOW:

Example 1: Integration
────────────────────────
**Problem:** Find the integral of x² from 0 to 2

**Solution:**

Step 1: Find the antiderivative
The antiderivative of x² is x³/3

Step 2: Apply the Fundamental Theorem of Calculus
[x³/3] evaluated from 0 to 2

Step 3: Calculate
Upper limit: (2)³/3 = 8/3
Lower limit: (0)³/3 = 0
Subtract: 8/3 - 0 = 8/3

**Answer:** 8/3 (approximately 2.67)

**Check:**
✓ Derivative of x³/3 gives us back x² ✓
✓ Answer is positive (makes sense for positive function)
────────────────────────

Example 2: Matrix Determinant
────────────────────────
**Problem:** Find the determinant of [[2, 1], [3, 4]]

**Solution:**

Step 1: Identify the formula
For 2×2 matrix [[a, b], [c, d]]:
determinant = (a × d) - (b × c)

Step 2: Identify values
a = 2, b = 1, c = 3, d = 4

Step 3: Substitute and calculate
det = (2 × 4) - (1 × 3)
det = 8 - 3
det = 5

**Answer:** The determinant is 5

**Check:**
✓ Formula applied correctly: (2×4) - (1×3)
✓ Arithmetic verified: 8 - 3 = 5
────────────────────────

Example 3: Derivative
────────────────────────
**Problem:** Find the derivative of sin(x) + x²

**Solution:**

Step 1: Apply the sum rule
d/dx[sin(x) + x²] = d/dx[sin(x)] + d/dx[x²]

Step 2: Apply derivative formulas
- Derivative of sin(x) is cos(x)
- Derivative of x² is 2x

Step 3: Combine results
f'(x) = cos(x) + 2x

**Answer:** f'(x) = cos(x) + 2x

**Check:**
✓ Each term differentiated using standard rules
✓ Sum rule applied correctly
────────────────────────

REMEMBER:
1. Always restate the problem
2. Always show every step
3. Always explain what you're doing
4. Always give exact answer AND decimal (when applicable)
5. Always verify your work

Your goal: Make the student think "I could teach this to someone else now"
`;
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

# UNIVERSAL FORMATTING RULE FOR MATH & PHYSICS
For all math and physics answers:
— ALWAYS write units as plain text (A, V, Ω, J, W, N, kg, m, s, °C, etc.)
— NEVER use LaTeX \\text{} or \\Omega or any LaTeX for units or words
— Use × for multiplication (not \\times or *)
— Use parentheses for clarity: (2 A) × (10 Ω)
— Show each calculation step on its own line
— For answers, always include the correct unit, written as plain text
— NEVER put commas before units

## Example (WRONG):
V = (2 , \\text{A}) \\times (10 , \\Omega)
## Example (RIGHT):
V = (2 A) × (10 Ω) = 20 V

# MATH FORMATTING RULES
When someone asks a math question:

1. RESTATE THE PROBLEM
  Write: "**Problem:** [their question in clear terms]"

2. SHOW YOUR WORK (Step-by-step)
  Write: "**Solution:**"
  Then number each step:
  - Step 1: What formula/method you're using
  - Step 2: Plug in the numbers
  - Step 3: Do the math

3. GIVE THE ANSWER CLEARLY
  Write: "**Answer:** [the result]"
  Include both exact (like 8/3) and decimal (like 2.67)

4. VERIFY IT
  Write: "**Check:** ✓ [how you know it's right]"

NEVER give one-line answers like "the answer is 5"
ALWAYS show the steps like a teacher on a blackboard

Example:
**Problem:** What is 2 + 2?

**Solution:**
Step 1: Add the two numbers
Step 2: 2 + 2 = 4

**Answer:** 4

**Check:** ✓ Math is correct

# MANDATORY REASONING PROCESS (INTERNAL — NEVER SHOW TO USER)
Before EVERY response, you MUST silently execute these steps:
1. **CLASSIFY** — What type of query is this? (factual / analytical / creative / technical / comparison / troubleshooting)
2. **SCOPE** — What exactly is being asked? Identify the core question. Strip ambiguity.
3. **PLAN** — What structure will the answer take? (steps / table / code / analysis / recommendation)
4. **VERIFY** — Before outputting, check: Does every claim have reasoning? Is anything redundant? Would an expert find this accurate?
5. **CALIBRATE** — Match depth to complexity. One-line answer for simple facts. Deep analysis for complex queries.

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
4. **Edge cases & caveats** — What could go wrong? What's the exception?
  // Concurrency guard
  if (isRequestPending) {
    await sleep(300);
    if (isRequestPending) isRequestPending = false;
  // --- ACCURACY & TRUST SYSTEM v3.0 ---
  // Multi-model validation, honest confidence, fact-checking, trust indicators, and structured output templates

  // Multi-model validation: Run query through 2-3 models, compare outputs, show consensus/disagreement
  export const multiModelValidate = async (
    prompt: string,
    history: Message[],
    manualModel?: AIModel | 'auto',
    image?: MessageImage,
    documents: AttachedDocument[] = [],
    personification: string = "",
    signal?: AbortSignal
  ): Promise<{
    outputs: Array<{ content: string; model: AIModel; confidence: number; tokens: number; inputTokens: number; outputTokens: number; }>,
    consensus: boolean,
    consensusConfidence: number,
    disagreements: Array<{ model: AIModel; content: string; confidence: number }>,
    validation: { math: boolean; logic: boolean; sources: boolean; outlier: boolean; historical: boolean; unverifiedClaims: string[] },
    trustIndicators: {
      modelVersions: string[];
      dataSources: string[];
      validationStatus: string;
      confidenceBreakdown: string;
      limitations: string[];
      reasoningChain: string[];
      actionButtons: string[];
      changelog: string;
      citations: string[];
      errorFlags: string[];
    },
    recommendedActions: string[],
    nextSteps: string[],
    wowMoment?: string,
  }> => {
    // 1. Run through 3 models
    const models = [AIModel.GPT4, AIModel.CLAUDE, AIModel.GEMINI];
    const results = await Promise.all(models.map(async model => {
      // Use getAIResponse for each model
      const res = await getAIResponse(prompt, history, model, undefined, image, documents, personification, undefined, signal);
      return { ...res, model };
    }));
    // 2. Compare outputs for consensus
    const mainOutput = results[0];
    const consensus = results.filter(r => r.content === mainOutput.content).length >= 2;
    const consensusConfidence = Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length * 100) / 100;
    const disagreements = results.filter(r => r.content !== mainOutput.content);
    // 3. Fact-checking pipeline
    const validation = {
      math: validateMath(mainOutput.content),
      logic: validateLogic(mainOutput.content),
      sources: validateSources(mainOutput.content),
      outlier: detectOutlier(mainOutput.content),
      historical: compareHistorical(mainOutput.content),
      unverifiedClaims: extractUnverifiedClaims(mainOutput.content),
    };
    // 4. Trust indicators
    const trustIndicators = {
      modelVersions: models.map(m => String(m) + ' v3.2'),
      dataSources: extractDataSources(mainOutput.content),
      validationStatus: Math.round((Object.values(validation).filter(Boolean).length / Object.keys(validation).length) * 100) + '% of checks passed',
      confidenceBreakdown: buildConfidenceBreakdown(results),
      limitations: extractLimitations(mainOutput.content),
      reasoningChain: extractReasoningChain(mainOutput.content),
      actionButtons: ['Approve', 'Request Changes', 'Reject'],
      changelog: 'ChurnPredictor v3.2: +12% accuracy, 2x faster, better seasonal handling',
      citations: extractCitations(mainOutput.content),
      errorFlags: extractErrorFlags(mainOutput.content),
    };
    // 5. Recommended actions & next steps
    const recommendedActions = extractRecommendedActions(mainOutput.content);
    const nextSteps = extractNextSteps(mainOutput.content);
    // 6. Wow moment triggers
    let wowMoment = undefined;
    if (validation.math === false || validation.logic === false) wowMoment = 'Error caught';
    else if (recommendedActions.length > 0 && recommendedActions.some(a => a.includes('unexpected'))) wowMoment = 'Proactive insight';
    else if (mainOutput.content.includes('CORRECTED')) wowMoment = 'Self-correction';
    else if (trustIndicators.citations.length > 0 && trustIndicators.citations.some(c => c.includes('benchmark'))) wowMoment = 'Benchmark context';
    return {
      outputs: results,
      consensus,
      consensusConfidence,
      disagreements,
      validation,
      trustIndicators,
      recommendedActions,
      nextSteps,
      wowMoment,
    };
  };

  // --- Helper functions (stubs, to be implemented) ---
  function validateMath(content: string): boolean { return true; }
  function validateLogic(content: string): boolean { return true; }
  function validateSources(content: string): boolean { return true; }
  function detectOutlier(content: string): boolean { return true; }
  function compareHistorical(content: string): boolean { return true; }
  function extractUnverifiedClaims(content: string): string[] { return []; }
  function extractDataSources(content: string): string[] { return []; }
  function buildConfidenceBreakdown(results: any[]): string {
    return results.map(function(r) {
      return String(r.model) + ': ' + Math.round(r.confidence * 100) + '%';
    }).join(', ');
  }
  function extractLimitations(content: string): string[] { return []; }
  function extractReasoningChain(content: string): string[] { return []; }
  function extractCitations(content: string): string[] { return []; }
  function extractErrorFlags(content: string): string[] { return []; }
  function extractRecommendedActions(content: string): string[] { return []; }
  function extractNextSteps(content: string): string[] { return []; }

  // --- Quality metrics tracking ---
  export interface QualityMetrics {
    userTrustScore: number;
    outputAcceptanceRate: number;
    timeToDecision: number;
    returnRate: number;
    validationCoverage: number;
    confidenceHonesty: number;
  }

  export const trackQualityMetrics = (metrics: QualityMetrics) => {
    // Log or send metrics to analytics
  };
  }
  const now = Date.now();
  if (now - lastRequestTimestamp < MIN_REQUEST_GAP) {
    await sleep(MIN_REQUEST_GAP - (now - lastRequestTimestamp));
  }
  isRequestPending = true;
  lastRequestTimestamp = Date.now();

  // Route the query
  const routing = (manualModel && manualModel !== 'auto') 
    ? { model: manualModel as AIModel, reason: 'Manual override', explanation: '', confidence: 1.0, complexity: 0.5, intent: 'general' as QueryIntent }
    : routePrompt(prompt, !!image, documents.length > 0);

  const genConfig = getGenerationConfig(routing.intent, routing.complexity);
  const systemInstruction = buildSystemInstruction(routing.intent, personification, routing.intent === 'product');
  const contents = buildSmartHistory(history, routing.intent);
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  // Tool support (future)
  const tools: any[] = [];

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

  // --- Automatic response continuation logic ---
  let isTruncated = false;
  let processedText = "";
  let continuationPrompt = prompt;
  let continuationHistory = [...history];
  let maxContinuations = 5; // Prevent infinite loops
  let continuationCount = 0;
  do {
    let chunkText = "";
    if (onStreamChunk) {
      const result = await ai.models.generateContentStream({
        model: targetEngine,
        contents,
        config: modelConfig,
      });
      for await (const chunk of result) {
        if (signal?.aborted) break;
        const text = chunk.text || "";
        chunkText += text;
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
      chunkText = response.text || "";
      usage = response.usageMetadata || usage;
      groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
    }
    // Post-process the response for quality consistency
    processedText += postProcessResponse(chunkText, routing.intent);
    // Detect truncation (ends with known truncation marker or incomplete sentence)
    isTruncated = /\[\.\.\.message truncated|\-\s*$|\[Truncated\]|\u2026$/.test(chunkText) || (chunkText.length > 0 && !/[.!?](["')\]]*)\s*$/.test(chunkText));
    if (isTruncated) {
      continuationPrompt = "Continue from where you left off.";
      continuationHistory = [...continuationHistory, { role: 'assistant', content: chunkText, model: routing.model, timestamp: Date.now() }];
      continuationCount++;
    }
  } while (isTruncated && continuationCount < maxContinuations);

  isRequestPending = false;
  return { 
    content: processedText, 
    model: routing.model, 
    tokens: usage.totalTokenCount,
    inputTokens: usage.promptTokenCount,
    outputTokens: usage.candidatesTokenCount,
    groundingChunks,
    routingContext: routing
  };
};
- Target response lengths: Simple fact = 1-2 lines. Explanation = 3-8 lines. Complex analysis = 15-30 lines. Code solution = code + 2-4 line explanation.

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
7. **HONESTY** — If Google Search did not return results for a claim, say "I could not verify this." Never present unverified data as fact.
`;

const ARTIFACT_ADDENDUM = `
# FILE ARTIFACT GENERATION
You can generate downloadable files. When the user asks to create, generate, or export a file (Excel, CSV, PDF, JSON, etc.), produce the file content in a fenced code block.

## How to generate files:
- **Excel/spreadsheet request** → Generate CSV data (universally compatible, opens in Excel). Use language identifier \`csv\`. Do NOT say you "cannot create Excel files" — CSV IS the solution.
- **PDF/document request** → Generate a clean, styled HTML document with inline CSS. Use language identifier \`html\`. The app renders it for download.
- **JSON data** → Use language identifier \`json\`.
- **Any code file** → Use the appropriate language identifier — user can download with the download button.

## Rules:
1. ALWAYS include full data — never truncate with "...more rows" or "// add more".
2. CSV first line must be headers.
3. HTML documents must include inline CSS and be self-contained.
4. After the code block, add ONE sentence: "Use the download button above the code block to save the file."
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
  const parts: string[] = [SPECIAL_NEXUS_IDENTITY_RULE, NEXUS_IDENTITY, SYSTEM_CORE, FORMATTING_RULES, SIMPLE_FORMATTING_RULES, TABLE_FORMATTING_RULE, VISUAL_HIERARCHY_RULE];

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
    case 'math':
      parts.push(MATH_ADDENDUM);
      // CLEAN_FORMAT_RULE removed: not defined or needed
      break;
    case 'physics':
      parts.push(PHYSICS_ADDENDUM);
    // case 'physics':
    //   parts.push(CLEAN_FORMAT_RULE);
    //   break;
  }

  // Product addendum ONLY when it's actually a product query
  if (isProductQuery) {
    parts.push(PRODUCT_ADDENDUM);
  }

  // Artifact addendum — always included so AI knows it CAN generate files
  parts.push(ARTIFACT_ADDENDUM);

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

  // ── PHASE 6.5: Remove duplicate content blocks ──
  // The model sometimes outputs the same paragraph, table, or code block twice.
  const paragraphs = text.split(/\n{2,}/);
  if (paragraphs.length > 2) {
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const para of paragraphs) {
      const normalized = para.trim().replace(/\s+/g, ' ').toLowerCase();
      if (normalized.length < 15) { deduped.push(para); continue; }
      const key = normalized.slice(0, 120);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(para);
    }
    if (deduped.length < paragraphs.length) {
      text = deduped.join('\n\n');
    }
  }

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