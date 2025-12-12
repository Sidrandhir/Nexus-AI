import React from 'react';
import { Message, Role } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import ModelBadge from './ModelBadge';
import { User, Bot } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`w-full py-6 md:py-8 border-b border-black/5 dark:border-white/5 ${isUser ? 'bg-transparent' : 'bg-nexus-800/30'}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-6 flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${isUser ? 'bg-nexus-600' : 'bg-nexus-primary'}`}>
            {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : 'NEXUS AI'}
            </span>
            {!isUser && message.model && <ModelBadge model={message.model} />}
          </div>
          
          <div className="text-gray-800 dark:text-gray-200">
             {/* Attachment Display */}
             {message.attachment && (
               <div className="mb-4">
                 <img 
                   src={message.attachment.url} 
                   alt={message.attachment.name} 
                   className="max-w-full md:max-w-sm rounded-lg border border-white/10 shadow-lg"
                 />
               </div>
             )}

             {message.isRouting ? (
               <div className="flex items-center gap-2 text-nexus-primary animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-nexus-primary animate-bounce"></div>
                 <div className="w-2 h-2 rounded-full bg-nexus-primary animate-bounce delay-100"></div>
                 <div className="w-2 h-2 rounded-full bg-nexus-primary animate-bounce delay-200"></div>
                 <span className="text-sm font-medium ml-2">Smart Router Analyzing...</span>
               </div>
             ) : (
                <MarkdownRenderer content={message.content} />
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;