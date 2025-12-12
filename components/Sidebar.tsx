
import React, { useState, useMemo } from 'react';
import { Plus, Search, LayoutDashboard, CreditCard, MessageSquare, Star, Archive, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Conversation, UsageData, User } from '../types';
import UsageBar from './UsageBar';
import SidebarItem from './SidebarItem';
import UserProfile from './UserProfile';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  usage: UsageData;
  user: User;
  onOpenDashboard: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onArchiveConversation: (id: string) => void;
  onStarConversation: (id: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation, 
  onNewChat,
  isOpen,
  setIsOpen,
  isCollapsed = false,
  toggleCollapse,
  usage,
  user,
  onOpenDashboard,
  onDeleteConversation,
  onRenameConversation,
  onArchiveConversation,
  onStarConversation,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');

  // Filter and Sort Conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // 1. Tab Filter
    if (activeTab === 'archived') {
      filtered = filtered.filter(c => c.isArchived);
    } else {
      filtered = filtered.filter(c => !c.isArchived);
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. Sort (Starred first, then date)
    return filtered.sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return b.lastModified - a.lastModified;
    });
  }, [conversations, searchQuery, activeTab]);

  const starredConversations = filteredConversations.filter(c => c.isStarred);
  const recentConversations = filteredConversations.filter(c => !c.isStarred);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-nexus-900 border-r border-nexus-700 transform transition-all duration-300 ease-in-out md:static md:inset-0 flex flex-col shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-72 w-72'}
      `}>
        
        {/* Header Section */}
        <div className={`p-4 space-y-3 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          
          <div className="flex items-center justify-between w-full">
            {/* New Chat Button */}
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-white shadow-sm hover:shadow-md group
                ${isCollapsed ? 'p-2.5 w-10 h-10' : 'gap-2 px-4 py-2.5 flex-1 mr-2'}
              `}
              title="New Chat"
            >
              <Plus className={`text-nexus-primary group-hover:scale-110 transition-transform ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span>New chat</span>}
            </button>

            {/* Collapse Toggle (Desktop) */}
            {toggleCollapse && !isCollapsed && (
              <button 
                onClick={toggleCollapse}
                className="hidden md:flex p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            )}
          </div>
          
           {/* Collapse Toggle (Icon Mode) */}
           {toggleCollapse && isCollapsed && (
              <button 
                onClick={toggleCollapse}
                className="hidden md:flex p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors mt-2"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}


          {/* Search & Tabs - Hidden when collapsed */}
          {!isCollapsed && (
            <>
              <div className="relative group w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-nexus-primary transition-colors" />
                <input 
                  id="sidebar-search"
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-nexus-800/50 text-sm text-gray-200 rounded-lg pl-9 pr-3 py-2 border border-transparent focus:border-nexus-primary/50 focus:bg-nexus-800 focus:outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="flex p-1 bg-nexus-800/50 rounded-lg w-full">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'all' 
                      ? 'bg-nexus-700 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" /> Chats
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'archived' 
                      ? 'bg-nexus-700 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Archive className="w-3 h-3" /> Archived
                </button>
              </div>
            </>
          )}
        </div>

        {/* List Section */}
        <div className={`flex-1 overflow-y-auto pb-2 custom-scrollbar ${isCollapsed ? 'px-1' : 'px-2'}`}>
          
          {/* Starred Section */}
          {starredConversations.length > 0 && (
            <div className="mb-4 animate-[fadeIn_0.3s_ease-out]">
              {!isCollapsed && (
                  <h3 className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-3 h-3 fill-gray-500" /> Favorites
                  </h3>
              )}
              {isCollapsed && (
                  <div className="h-px bg-white/5 my-2 mx-2"></div>
              )}
              {starredConversations.map(conv => (
                <SidebarItem 
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  onRename={onRenameConversation}
                  onDelete={onDeleteConversation}
                  onArchive={onArchiveConversation}
                  onStar={onStarConversation}
                  collapsed={isCollapsed}
                />
              ))}
            </div>
          )}

          {/* Recent Section */}
          <div>
            {starredConversations.length > 0 && recentConversations.length > 0 && !isCollapsed && (
               <h3 className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recents</h3>
            )}
            
            {recentConversations.slice(0, 20).map(conv => (
              <SidebarItem 
                key={conv.id}
                conversation={conv}
                isActive={activeConversationId === conv.id}
                onSelect={(id) => {
                  onSelectConversation(id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                onRename={onRenameConversation}
                onDelete={onDeleteConversation}
                onArchive={onArchiveConversation}
                onStar={onStarConversation}
                collapsed={isCollapsed}
              />
            ))}
            
            {recentConversations.length > 20 && !isCollapsed && (
                <div className="px-4 py-3 text-xs text-center text-gray-600 italic">
                    Showing last 20 of {recentConversations.length} chats
                </div>
            )}

            {filteredConversations.length === 0 && !isCollapsed && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-50">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  {activeTab === 'archived' ? <Archive className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                </div>
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'No chats found' : (activeTab === 'archived' ? 'No archived chats' : 'No chats yet')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto border-t border-white/10 bg-nexus-900/50 pb-2">
            {!isCollapsed && (
                <div className="pt-4">
                    <UsageBar usage={usage} />
                </div>
            )}

            <div className={`px-2 space-y-1 ${isCollapsed ? 'pt-2' : ''}`}>
              <button 
                onClick={() => {
                   onOpenDashboard();
                   if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`flex items-center rounded-md hover:bg-white/5 text-sm text-gray-300 transition-colors group
                   ${isCollapsed ? 'justify-center p-2 mx-auto w-10 h-10' : 'gap-3 w-full px-3 py-2.5'}
                `}
                title="Dashboard"
              >
                <div className={`rounded bg-gray-800 group-hover:bg-nexus-primary/20 transition-colors ${isCollapsed ? 'p-1.5' : 'p-1'}`}>
                    <LayoutDashboard className="w-3.5 h-3.5" />
                </div>
                {!isCollapsed && <span>Dashboard</span>}
              </button>
              
              {usage.tier === 'PRO' && (
                <button 
                    onClick={() => {
                        onOpenDashboard();
                        if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`flex items-center rounded-md hover:bg-white/5 text-sm text-gray-300 transition-colors group
                       ${isCollapsed ? 'justify-center p-2 mx-auto w-10 h-10' : 'gap-3 w-full px-3 py-2.5'}
                    `}
                    title="Billing"
                >
                    <div className={`rounded bg-gray-800 group-hover:bg-green-500/20 transition-colors ${isCollapsed ? 'p-1.5' : 'p-1'}`}>
                        <CreditCard className="w-3.5 h-3.5 text-green-500" />
                    </div>
                    {!isCollapsed && <span>Billing</span>}
                </button>
              )}
            </div>
            
            {/* User Profile Component */}
            <div className={`mt-2 border-t border-white/5 pt-2 ${isCollapsed ? 'px-1' : 'mx-2'}`}>
               <UserProfile 
                 user={user} 
                 tier={usage.tier} 
                 onLogout={onLogout}
                 collapsed={isCollapsed}
               />
            </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          className="absolute top-4 right-[-40px] md:hidden p-2 bg-nexus-800 text-white rounded-r-md shadow-lg"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
