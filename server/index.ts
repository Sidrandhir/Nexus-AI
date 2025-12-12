import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Middleware ---
const authenticate = async (req: any, res: any, next: any) => {
  // Simple header check for demo purposes. 
  // In production, verify JWT token here.
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

// --- Conversations API ---

// List Conversations
app.get('/api/conversations', authenticate, async (req: any, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: true // Include messages or fetch separately depending on payload size preference
      }
    });
    // Transform BigInt timestamp to number for JSON
    const sanitized = JSON.parse(JSON.stringify(conversations, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create Conversation
app.post('/api/conversations', authenticate, async (req: any, res) => {
  try {
    const { title, preferredModel } = req.body;
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.userId,
        title: title || 'New Chat',
        preferredModel: preferredModel || 'AUTO'
      }
    });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Delete Conversation
app.delete('/api/conversations/:id', authenticate, async (req: any, res) => {
  try {
    await prisma.conversation.deleteMany({
      where: { 
        id: req.params.id,
        userId: req.userId // Ensure ownership
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Update Conversation (Rename, Archive, Star)
app.patch('/api/conversations/:id', authenticate, async (req: any, res) => {
  try {
    const { title, isArchived, isStarred, preferredModel } = req.body;
    const conversation = await prisma.conversation.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: { 
        ...(title !== undefined && { title }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isStarred !== undefined && { isStarred }),
        ...(preferredModel !== undefined && { preferredModel })
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// --- Messages API ---

// Add Message
app.post('/api/messages', authenticate, async (req: any, res) => {
  try {
    const { conversationId, role, content, model, attachment } = req.body;
    
    // Verify ownership first
    const conv = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: req.userId }
    });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        model,
        timestamp: BigInt(Date.now()),
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    res.json({ 
        ...message, 
        timestamp: Number(message.timestamp) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// --- Usage API ---

app.get('/api/usage', authenticate, async (req: any, res) => {
  try {
      // Aggregate usage logic would go here
      const today = new Date().toISOString().split('T')[0];
      const usage = await prisma.usage.findUnique({
          where: {
              userId_date: { userId: req.userId, date: today }
          }
      });
      res.json(usage || { messageCount: 0, tokensUsed: 0 });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
