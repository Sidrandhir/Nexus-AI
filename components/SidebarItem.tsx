
import React, { useState, useRef, useEffect } from 'react';
import { Conversation } from '../types';
import { MessageSquare, MoreVertical, Trash2, Edit2, Archive, Star, Check, X } from 'lucide-react';

interface SidebarItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onStar: (id: string) => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onArchive,
  onStar,
  collapsed = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveRename = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editValue.trim()) {
      onRename(conversation.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancelRename = () => {
    setEditValue(conversation.title);
    setIsEditing(false);
  };

  if (isEditing && !collapsed) {
    return (
      <div className="px-2 py-1">
        <form onSubmit={handleSaveRename} className="flex items-center gap-1 bg-nexus-800 rounded p-1 border border-nexus-primary">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none px-1 min-w-0"
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancelRename();
            }}
          />
          <button type="submit" className="p-1 hover:bg-nexus-700 rounded text-green-400">
            <Check className="w-3 h-3" />
          </button>
          <button type="button" onClick={handleCancelRename} className="p-1 hover:bg-nexus-700 rounded text-red-400">
            <X className="w-3 h-3" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div 
      className={`group relative flex items-center ${collapsed ? 'justify-center px-1' : 'gap-3 px-3 mx-2'} py-2.5 rounded-md cursor-pointer transition-all ${
        isActive 
          ? 'bg-nexus-800 text-white shadow-lg shadow-black/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
      onClick={() => onSelect(conversation.id)}
      title={collapsed ? conversation.title : undefined}
    >
      <div className="flex-shrink-0">
         {conversation.isStarred ? (
             <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
         ) : (
             <MessageSquare className={`w-4 h-4 ${isActive ? 'text-nexus-primary' : 'text-gray-500 group-hover:text-gray-400'}`} />
         )}
      </div>
      
      {!collapsed && (
        <span className="truncate text-sm flex-1 pr-6">{conversation.title}</span>
      )}

      {/* Hover Actions (Desktop) */}
      {!collapsed && (
        <div 
            className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-nexus-800/90 rounded shadow-sm md:flex hidden"
            onClick={(e) => e.stopPropagation()} // Prevent selecting chat when clicking actions
        >
            <button 
            onClick={() => onStar(conversation.id)} 
            className="p-1.5 hover:text-yellow-400 text-gray-400" 
            title={conversation.isStarred ? "Unstar" : "Star"}
            >
                <Star className={`w-3 h-3 ${conversation.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
            <button 
                onClick={() => {
                    setEditValue(conversation.title);
                    setIsEditing(true);
                }} 
                className="p-1.5 hover:text-blue-400 text-gray-400"
                title="Rename"
            >
                <Edit2 className="w-3 h-3" />
            </button>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:text-white text-gray-400"
            >
                <MoreVertical className="w-3 h-3" />
            </button>
        </div>
      )}

      {/* Mobile Menu Button - Only show if not collapsed */}
       {!collapsed && (
           <div 
            className="absolute right-2 md:hidden opacity-100"
            onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
            }}
          >
             <MoreVertical className="w-4 h-4 text-gray-500" />
          </div>
       )}


      {/* Dropdown Menu */}
      {showMenu && !collapsed && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-8 z-50 w-48 bg-nexus-900 border border-white/10 rounded-lg shadow-xl py-1 overflow-hidden animate-[scaleIn_0.1s_ease-out] origin-top-right"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => { onStar(conversation.id); setShowMenu(false); }}
            className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <Star className="w-3 h-3" /> {conversation.isStarred ? 'Unstar' : 'Star'}
          </button>
          <button 
            onClick={() => { setIsEditing(true); setShowMenu(false); }}
            className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <Edit2 className="w-3 h-3" /> Rename
          </button>
          <button 
            onClick={() => { onArchive(conversation.id); setShowMenu(false); }}
            className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <Archive className="w-3 h-3" /> {conversation.isArchived ? 'Unarchive' : 'Archive'}
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button 
            onClick={() => { onDelete(conversation.id); setShowMenu(false); }}
            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
