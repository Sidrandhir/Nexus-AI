
import React, { useState, useRef, useEffect } from 'react';
import { User, UserTier } from '../types';
import { LogOut, Settings, User as UserIcon, Crown, Activity } from 'lucide-react';
import { logout } from '../services/authService';

interface UserProfileProps {
  user: User;
  tier: UserTier;
  onLogout: () => void;
  compact?: boolean;
  collapsed?: boolean;
  onOpenAdmin?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, tier, onLogout, compact = false, collapsed = false, onOpenAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <div 
        className={`flex items-center ${collapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg cursor-pointer transition-colors ${
          isOpen ? 'bg-nexus-800' : 'hover:bg-nexus-800/50'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title={collapsed ? user.name : undefined}
      >
        <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-nexus-primary flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            {tier === 'PRO' && (
                <div className="absolute -top-1 -right-1 bg-nexus-900 rounded-full p-0.5">
                    <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
            )}
        </div>
        
        {!compact && !collapsed && (
          <div className="flex-1 overflow-hidden text-left">
            <div className="text-xs font-medium text-white truncate">{user.name || 'User'}</div>
            <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className={`absolute bottom-full mb-2 bg-nexus-800 border border-white/10 rounded-lg shadow-xl overflow-hidden animate-[scaleIn_0.1s_ease-out] origin-bottom-left z-50 ${collapsed ? 'left-0 w-56' : 'left-0 w-full'}`}>
          <div className="p-3 border-b border-white/5">
             <div className="text-sm font-bold text-white">{user.name}</div>
             <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          
          {user.isAdmin && (
            <button 
                onClick={() => { setIsOpen(false); if (onOpenAdmin) onOpenAdmin(); }}
                className="w-full text-left px-4 py-2 text-xs text-nexus-primary font-bold hover:bg-nexus-primary/10 flex items-center gap-2 border-b border-white/5"
            >
                <Activity className="w-3.5 h-3.5" /> Admin Dashboard
            </button>
          )}

          <button className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
