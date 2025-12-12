import { Conversation, Message, UsageData } from "../types";

// SET THIS TO FALSE WHEN CONNECTED TO REAL BACKEND
const MOCK_MODE = true; 
const API_URL = 'http://localhost:3001/api';

const getHeaders = (userId: string) => ({
    'Content-Type': 'application/json',
    'x-user-id': userId
});

// --- Conversations ---

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
    if (MOCK_MODE) {
        // Fallback to Local Storage
        const stored = localStorage.getItem(`nexus_conversations_${userId}`);
        return stored ? JSON.parse(stored) : [];
    }

    const response = await fetch(`${API_URL}/conversations`, {
        headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
};

export const createConversation = async (userId: string, conversation: Conversation): Promise<Conversation> => {
    if (MOCK_MODE) {
        const stored = await fetchConversations(userId);
        const updated = [conversation, ...stored];
        localStorage.setItem(`nexus_conversations_${userId}`, JSON.stringify(updated));
        return conversation;
    }

    const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: getHeaders(userId),
        body: JSON.stringify({
            title: conversation.title,
            preferredModel: conversation.preferredModel
        })
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
};

export const updateConversation = async (userId: string, conversation: Conversation): Promise<void> => {
    if (MOCK_MODE) {
        const stored = await fetchConversations(userId);
        const updated = stored.map(c => c.id === conversation.id ? conversation : c);
        localStorage.setItem(`nexus_conversations_${userId}`, JSON.stringify(updated));
        return;
    }

    await fetch(`${API_URL}/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: getHeaders(userId),
        body: JSON.stringify({
            title: conversation.title,
            isStarred: conversation.isStarred,
            isArchived: conversation.isArchived,
            preferredModel: conversation.preferredModel
        })
    });
};

export const deleteConversation = async (userId: string, conversationId: string): Promise<void> => {
    if (MOCK_MODE) {
        const stored = await fetchConversations(userId);
        const updated = stored.filter(c => c.id !== conversationId);
        localStorage.setItem(`nexus_conversations_${userId}`, JSON.stringify(updated));
        return;
    }

    await fetch(`${API_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: getHeaders(userId)
    });
};

// --- Messages ---

export const saveMessage = async (userId: string, conversationId: string, message: Message): Promise<Message> => {
    if (MOCK_MODE) {
        // In mock mode, we update the conversation directly in updateConversation logic essentially
        // But for clarity, let's just ensure the conversation state in App.tsx is saved
        return message; 
    }

    const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: getHeaders(userId),
        body: JSON.stringify({
            conversationId,
            role: message.role,
            content: message.content,
            model: message.model,
            attachment: message.attachment
        })
    });
    if (!response.ok) throw new Error('Failed to save message');
    return response.json();
};

// --- Usage ---

export const fetchUsage = async (userId: string): Promise<Partial<UsageData> | null> => {
    if (MOCK_MODE) {
        return null; // Usage service handles local storage fallback
    }

    const response = await fetch(`${API_URL}/usage`, {
        headers: getHeaders(userId)
    });
    if (!response.ok) return null;
    return response.json();
};
