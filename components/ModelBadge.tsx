import React from 'react';
import { ModelProvider } from '../types';
import { Bot, Zap, Code, Brain } from 'lucide-react';

interface ModelBadgeProps {
  model: ModelProvider;
}

const ModelBadge: React.FC<ModelBadgeProps> = ({ model }) => {
  const getBadgeConfig = () => {
    switch (model) {
      case ModelProvider.GEMINI:
        return {
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: <Zap className="w-3 h-3 mr-1" />,
          label: 'Gemini 2.5 Flash'
        };
      case ModelProvider.CLAUDE:
        return {
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          icon: <Code className="w-3 h-3 mr-1" />,
          label: 'Claude 3.5 Sonnet'
        };
      case ModelProvider.GPT4:
        return {
          color: 'bg-green-500/10 text-green-400 border-green-500/20',
          icon: <Brain className="w-3 h-3 mr-1" />,
          label: 'GPT-4o'
        };
      default:
        return {
          color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          icon: <Bot className="w-3 h-3 mr-1" />,
          label: 'Unknown'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.color} select-none`}>
      {config.icon}
      {config.label}
    </div>
  );
};

export default ModelBadge;
