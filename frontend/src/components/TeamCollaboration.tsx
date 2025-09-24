import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Users, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Bell,
  BellOff,
  Star,
  Pin,
  Edit3,
  Trash2,
  Reply,
  Share,
  Download,
  Eye,
  EyeOff,
  UserPlus,
  Settings,
  Maximize2,
  Minimize2,
  Activity,
  Clock
} from 'lucide-react';
import { AnimatedCounter, PulsingDots } from './AnimatedElements';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

interface TeamCollaborationProps {
  className?: string;
  workspaceId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  isEdited?: boolean;
  replyTo?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'project' | 'direct' | 'announcement';
  members: string[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  isPrivate: boolean;
}

export const TeamCollaboration: React.FC<TeamCollaborationProps> = ({
  className = "",
  workspaceId = "default"
}) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<TeamMember[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [showMemberList, setShowMemberList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data initialization
  useEffect(() => {
    const mockChannels: ChatChannel[] = [
      {
        id: 'general',
        name: 'General',
        description: 'General team discussions',
        type: 'general',
        members: ['user1', 'user2', 'user3', 'user4'],
        unreadCount: 0,
        isPrivate: false
      },
      {
        id: 'logistics',
        name: 'Logistics',
        description: 'Shipping and logistics coordination',
        type: 'project',
        members: ['user1', 'user2', 'user3'],
        unreadCount: 3,
        isPrivate: false
      },
      {
        id: 'customer-service',
        name: 'Customer Service',
        description: 'Customer support discussions',
        type: 'project',
        members: ['user1', 'user4'],
        unreadCount: 1,
        isPrivate: false
      },
      {
        id: 'announcements',
        name: 'Announcements',
        description: 'Important company updates',
        type: 'announcement',
        members: ['user1', 'user2', 'user3', 'user4'],
        unreadCount: 0,
        isPrivate: false
      }
    ];

    const mockMembers: TeamMember[] = [
      {
        id: 'user1',
        name: user?.firstName + ' ' + user?.lastName || 'Current User',
        role: user?.role || 'Team Member',
        status: 'online'
      },
      {
        id: 'user2',
        name: 'Sarah Johnson',
        role: 'Logistics Manager',
        status: 'online'
      },
      {
        id: 'user3',
        name: 'Mike Chen',
        role: 'Customer Service',
        status: 'away'
      },
      {
        id: 'user4',
        name: 'Emily Davis',
        role: 'Operations Lead',
        status: 'busy'
      }
    ];

    const mockMessages: ChatMessage[] = [
      {
        id: 'msg1',
        senderId: 'user2',
        senderName: 'Sarah Johnson',
        content: 'Good morning team! We have 15 new shipments to process today.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text'
      },
      {
        id: 'msg2',
        senderId: 'user3',
        senderName: 'Mike Chen',
        content: 'I\'ve updated the delivery schedules for this week. All routes are optimized.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'text'
      },
      {
        id: 'msg3',
        senderId: 'user4',
        senderName: 'Emily Davis',
        content: 'Great work everyone! Customer satisfaction is up 12% this month.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text',
        reactions: [
          { emoji: '👍', users: ['user1', 'user2'] },
          { emoji: '🎉', users: ['user1'] }
        ]
      }
    ];

    setChannels(mockChannels);
    setOnlineMembers(mockMembers);
    setMessages(mockMessages);
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate real-time features
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate typing indicators
      if (Math.random() < 0.1) { // 10% chance
        const randomMember = onlineMembers[Math.floor(Math.random() * onlineMembers.length)];
        if (randomMember.id !== 'user1') {
          setIsTyping(prev => [...prev, randomMember.name]);
          setTimeout(() => {
            setIsTyping(prev => prev.filter(name => name !== randomMember.name));
          }, 3000);
        }
      }

      // Simulate new messages occasionally
      if (Math.random() < 0.05) { // 5% chance
        const randomMember = onlineMembers[Math.floor(Math.random() * onlineMembers.length)];
        if (randomMember.id !== 'user1') {
          const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: randomMember.id,
            senderName: randomMember.name,
            content: getRandomMessage(),
            timestamp: new Date(),
            type: 'text'
          };
          
          setMessages(prev => [...prev, newMsg]);
          
          createNotification({
            title: 'New Message',
            message: `${randomMember.name}: ${newMsg.content.substring(0, 50)}...`,
            type: 'system_alert'
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [onlineMembers, createNotification]);

  const getRandomMessage = () => {
    const messages = [
      "Just finished processing the morning shipments.",
      "Customer called about delivery ETA - all good!",
      "Route optimization complete for today.",
      "New carrier partnership looks promising.",
      "Inventory levels are looking healthy.",
      "Great teamwork on that urgent delivery!",
      "Weather update: clear skies for all routes.",
      "Monthly KPIs are trending upward."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'user1',
      senderName: user?.firstName + ' ' + user?.lastName || 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator for responses
    setTimeout(() => {
      const responder = onlineMembers.find(m => m.id !== 'user1' && m.status === 'online');
      if (responder) {
        setIsTyping(prev => [...prev, responder.name]);
        setTimeout(() => {
          setIsTyping(prev => prev.filter(name => name !== responder.name));
        }, 2000);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes('user1')) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(u => u !== 'user1');
            if (existingReaction.users.length === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            // Add reaction
            existingReaction.users.push('user1');
          }
        } else {
          // New reaction
          reactions.push({ emoji, users: ['user1'] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const containerClasses = `
    ${className}
    ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'relative'}
    flex flex-col h-full
  `;

  return (
    <div className={containerClasses}>
      {/* Mobile-First Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Chat
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Activity className="w-3 h-3 text-green-500" />
                <span>{onlineMembers.filter(m => m.status === 'online').length} online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMemberList(!showMemberList)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors sm:hidden"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Channels Sidebar - Mobile Responsive */}
        <div className="w-full sm:w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex flex-col">
          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Channels
              </h3>
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg mb-1 transition-colors text-left ${
                    selectedChannel === channel.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-gray-400">#</span>
                    <span className="font-medium truncate">{channel.name}</span>
                  </div>
                  {channel.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  #{channels.find(c => c.id === selectedChannel)?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {channels.find(c => c.id === selectedChannel)?.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {message.senderName.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  
                  <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      {message.reactions.map(reaction => (
                        <button
                          key={reaction.emoji}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                            reaction.users.includes('user1')
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.users.length}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => addReaction(message.id, '👍')}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicators */}
            {isTyping.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <PulsingDots />
                <span>
                  {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message #${channels.find(c => c.id === selectedChannel)?.name}`}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Members Sidebar - Desktop Only or Mobile Overlay */}
        {(showMemberList || window.innerWidth >= 1024) && (
          <div className={`
            ${showMemberList ? 'absolute inset-y-0 right-0 z-10 sm:relative sm:z-auto' : 'hidden lg:block'}
            w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col
          `}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Team Members
                </h3>
                <button
                  onClick={() => setShowMemberList(false)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors sm:hidden"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <AnimatedCounter value={onlineMembers.filter(m => m.status === 'online').length} /> online
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {onlineMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
