import { Conversation, Role } from "../types";

export const exportAsText = (conversation: Conversation) => {
  const header = `NEXUS AI CONVERSATION EXPORT\nTitle: ${conversation.title}\nDate: ${new Date(conversation.createdAt).toLocaleString()}\n----------------------------------------\n\n`;
  
  const content = conversation.messages.map(m => {
    const role = m.role === Role.USER ? 'USER' : `NEXUS AI (${m.model || 'System'})`;
    const time = new Date(m.timestamp).toLocaleTimeString();
    return `[${time}] ${role}:\n${m.content}\n\n----------------------------------------\n`;
  }).join('\n');

  const blob = new Blob([header + content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAsJSON = (conversation: Conversation) => {
  const data = JSON.stringify(conversation, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
