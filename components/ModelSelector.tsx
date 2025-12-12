import React, { useState, useRef, useEffect } from 'react';
import { ModelProvider, RoutingMode } from '../types';
import { Bot, Zap, Code, Brain, ChevronDown, Sparkles } from 'lucide-react';

interface ModelSelectorProps {
  currentMode: RoutingMode;
  onSelect: (mode: RoutingMode) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ currentMode, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    {
      id: 'AUTO',
      label: 'Auto (Smart Routing)',
      icon: <Sparkles className="w-4 h-4 text-nexus-primary" />,
      description: 'Intelligently selects the best model based on your prompt'
    },
    {
      id: ModelProvider.GPT4,
      label: 'OpenAI GPT-4o',
      icon: <Brain className="w-4 h-4 text-green-400" />,
      description: 'Best for general knowledge, reasoning, and logic'
    },
    {
      id: ModelProvider.CLAUDE,
      label: 'Claude 3.5 Sonnet',
      icon: <Code className="w-4 h-4 text-orange-400" />,
      description: 'Best for coding, creative writing, and analysis'
    },
    {
      id: ModelProvider.GEMINI,
      label: 'Gemini 2.5 Flash',
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      description: 'Best for real-time information and speed'
    }
  ];

  const selectedOption = options.find(o => o.id === currentMode) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}
          ${currentMode === 'AUTO' 
            ? 'bg-nexus-primary/10 border-nexus-primary/30 text-nexus-primary' 
            : 'bg-nexus-800 border-white/10 text-gray-300'
          }
        `}
      >
        {selectedOption.icon}
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-nexus-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-[scaleIn_0.1s_ease-out] origin-bottom-left">
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.id as RoutingMode);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex items-start gap-3 transition-colors
                  ${currentMode === option.id ? 'bg-white/10' : 'hover:bg-white/5'}
                `}
              >
                <div className="mt-0.5">{option.icon}</div>
                <div>
                  <div className={`text-sm font-medium ${currentMode === option.id ? 'text-white' : 'text-gray-300'}`}>
                    {option.label}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                    {option.description}
                  </div>
                </div>
                {currentMode === option.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nexus-primary mt-2"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;