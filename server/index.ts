import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import { users, conversations, messages } from '../shared/schema';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const sessions = new Map<string, number>();

function generateSessionToken(): string {
  return crypto.randomUUID();
}

app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Database not configured. Authentication disabled for development.' });
      return;
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning();

    const token = generateSessionToken();
    sessions.set(token, newUser.id);

    res.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Database not configured. Authentication disabled for development.' });
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateSessionToken();
    sessions.set(token, user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token ? sessions.get(token) : undefined;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    const conversationsWithMessages = await Promise.all(
      userConversations.map(async (conv) => {
        const msgs = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(messages.createdAt);

        return {
          id: conv.id.toString(),
          title: conv.title,
          messages: msgs.map((msg) => ({
            id: msg.id.toString(),
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: msg.createdAt.getTime(),
          })),
          createdAt: conv.createdAt.getTime(),
        };
      })
    );

    res.json(conversationsWithMessages);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.post('/api/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token ? sessions.get(token) : undefined;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title } = req.body;

    const [newConversation] = await db.insert(conversations).values({
      userId,
      title: title || 'New Chat',
    }).returning();

    res.json({
      id: newConversation.id.toString(),
      title: newConversation.title,
      messages: [],
      createdAt: newConversation.createdAt.getTime(),
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

app.post('/api/conversations/:id/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token ? sessions.get(token) : undefined;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const conversationId = parseInt(req.params.id);
    const { role, content } = req.body;

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const [newMessage] = await db.insert(messages).values({
      conversationId,
      role,
      content,
    }).returning();

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    res.json({
      id: newMessage.id.toString(),
      role: newMessage.role,
      content: newMessage.content,
      timestamp: newMessage.createdAt.getTime(),
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

app.delete('/api/conversations/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({ error: 'Database not configured' });
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token ? sessions.get(token) : undefined;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const conversationId = parseInt(req.params.id);

    await db
      .delete(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!db) {
    console.log('⚠️  Database not configured - Authentication features disabled');
    console.log('   Main features (Analyze, Discover, Compose) will work without database');
    console.log('   To enable authentication, set DATABASE_URL in .env.local');
  }
});
