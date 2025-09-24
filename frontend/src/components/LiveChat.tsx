import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  User,
  Bot,
  Clock,
  CheckCheck,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  agentName?: string;
  agentAvatar?: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'away';
  department: string;
  rating: number;
}

export const LiveChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Debug: Log when component mounts and renders
  React.useEffect(() => {
    console.log('🤖 LiveChat component mounted - Romeo Newton is ready!');
    console.log('🔍 Current user:', user);
    console.log('💬 Chat is open:', isOpen);
  }, []);

  React.useEffect(() => {
    console.log('💬 Chat state changed - isOpen:', isOpen);
  }, [isOpen]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const responseTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock agents
  const agents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Romeo Newton',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'online',
      department: 'Technical Support',
      rating: 4.9
    },
    {
      id: 'agent-2',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      status: 'online',
      department: 'Customer Support',
      rating: 4.8
    },
    {
      id: 'agent-3',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      status: 'busy',
      department: 'Logistics',
      rating: 4.7
    },
    {
      id: 'agent-4',
      name: 'Alex Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      status: 'online',
      department: 'Sales & Quotes',
      rating: 4.6
    }
  ];

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Prioritize Romeo Newton as the primary agent
      const romeoAgent = agents.find(a => a.name === 'Romeo Newton') || agents[0];
      setCurrentAgent(romeoAgent);

      // Simulate connection status changes
      setConnectionStatus('connecting');
      setTimeout(() => setConnectionStatus('connected'), 1500);

      // Add welcome message with more personality
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: 'welcome-1',
          sender: 'agent',
          content: `Hi ${user?.firstName || 'Newton'}! 👋 I'm Romeo Newton from Technical Support. Welcome to ShipSmart's advanced tracking platform!`,
          timestamp: new Date(),
          type: 'text',
          status: 'delivered',
          agentName: romeoAgent.name,
          agentAvatar: romeoAgent.avatar
        };

        setMessages([welcomeMessage]);

        // Add a follow-up message
        setTimeout(() => {
          const followUpMessage: Message = {
            id: 'welcome-2',
            sender: 'agent',
            content: `I'm here to help you with our cutting-edge features: real-time tracking, live analytics, AI-powered insights, and technical support. What would you like to explore? 🚀`,
            timestamp: new Date(),
            type: 'text',
            status: 'delivered',
            agentName: romeoAgent.name,
            agentAvatar: romeoAgent.avatar
          };
          
          setMessages(prev => [...prev, followUpMessage]);
        }, 2000);
      }, 2000);
    }
  }, [isOpen, user, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate agent responses - simplified and more reliable
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only respond to user messages and avoid duplicate responses
      if (lastMessage.sender === 'user' && !isResponding) {
        console.log('Romeo Newton responding to:', lastMessage.content);
        setIsResponding(true);
        
        // Show typing indicator
        setTypingUsers([currentAgent?.name || 'Romeo Newton']);
        
        // Generate response after typing delay
        setTimeout(() => {
          setTypingUsers([]);
          
          // Get response from Romeo Newton
          const responses = getAgentResponse(lastMessage.content);
          console.log('Romeo Newton responses:', responses);
          
          // Add each response with delay
          responses.forEach((response, index) => {
            setTimeout(() => {
              const agentMessage: Message = {
                id: `romeo-${Date.now()}-${index}`,
                sender: 'agent',
                content: response,
                timestamp: new Date(),
                type: 'text',
                status: 'delivered',
                agentName: currentAgent?.name || 'Romeo Newton',
                agentAvatar: currentAgent?.avatar
              };
              
              setMessages(prev => [...prev, agentMessage]);
              
              // Reset responding state after last message
              if (index === responses.length - 1) {
                setTimeout(() => {
                  setIsResponding(false);
                  console.log('Romeo Newton finished responding');
                }, 300);
              }
            }, index * 1000);
          });
        }, 1500);
      }
    }
  }, [messages, currentAgent, isResponding]);

  // Update unread count
  useEffect(() => {
    if (!isOpen) {
      const unreadMessages = messages.filter(m => 
        m.sender === 'agent' && m.status !== 'read'
      ).length;
      setUnreadCount(unreadMessages);
    } else {
      setUnreadCount(0);
      // Mark all messages as read
      setMessages(prev => prev.map(m => ({ ...m, status: 'read' as const })));
    }
  }, [isOpen, messages]);

  const getAgentResponse = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    console.log('Getting response for message:', lowerMessage);
    
    // Check for tracking numbers or product IDs
    const trackingPattern = /^(SS|SH|FX|UP|DHL|TNT|MAERSK)\d{6,12}$/i;
    const productIdPattern = /^(PRD|PROD|ID|SKU)\d{4,8}$/i;
    const genericIdPattern = /^\w{2,4}\d{6,12}$/;
    
    if (trackingPattern.test(userMessage.trim()) || genericIdPattern.test(userMessage.trim())) {
      const trackingId = userMessage.trim().toUpperCase();
      return [
        `Perfect! I found tracking information for ${trackingId} 🎯`,
        "Let me pull up the real-time data... Your shipment is currently in Phoenix, AZ at our distribution center.",
        "📊 Status: In Transit | 🚛 Vehicle: TRK-4521 | ⏱️ ETA: 18 hours | 📍 Next Stop: Denver, CO",
        "I'm also enabling live map tracking and analytics for you. You can see the vehicle moving in real-time with our enhanced tracking system! Would you like me to show you the delivery probability and environmental impact data?"
      ];
    } else if (productIdPattern.test(userMessage.trim())) {
      const productId = userMessage.trim().toUpperCase();
      return [
        `Excellent! I found product details for ${productId} 📋`,
        "This is one of our premium freight solutions. Let me get you the complete specifications and pricing information.",
        "💰 Current Rate: $2,450 | 📏 Dimensions: 48\"×40\"×36\" | ⚖️ Weight Capacity: 2,200 lbs | 🌍 Service: International Express",
        "This product includes our AI-powered route optimization, real-time tracking, and carbon footprint monitoring. Would you like me to generate a custom quote or show you similar products?"
      ];
    } else if (lowerMessage.includes('track') || lowerMessage.includes('shipment')) {
      return [
        "I can definitely help you track your shipment! 📦",
        "Please provide your tracking number (format: SS123456789) and I'll get you real-time updates with live map tracking and analytics."
      ];
    } else if (lowerMessage.includes('delay') || lowerMessage.includes('late')) {
      return [
        "I understand your concern about potential delays. Let me check the current status and provide you with detailed analytics.",
        "Our system shows real-time traffic, weather conditions, and estimated delivery times. I'll pull up the live tracking data for you! ⏰"
      ];
    } else if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return [
        "I'd be happy to help you get an instant quote! 💰",
        "Our AI-powered pricing system can give you real-time rates. I'll need: origin, destination, cargo type, weight, and dimensions. Would you like to start the quote process?"
      ];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return [
        "Hello there! Great to connect with you! 😊",
        "I'm Romeo Newton from Technical Support. I can help with tracking, live analytics, quotes, technical issues, or any questions about our platform. What brings you here today?"
      ];
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error')) {
      return [
        "I'm sorry to hear you're experiencing a technical issue. As part of our Technical Support team, I'm here to help! 🔧",
        "Can you describe what's happening? I can troubleshoot tracking issues, login problems, or any platform-related concerns."
      ];
    } else if (lowerMessage.includes('analytics') || lowerMessage.includes('data') || lowerMessage.includes('report')) {
      return [
        "Great question about our analytics! 📊",
        "Our platform provides real-time analytics including delivery probability, fuel efficiency, CO₂ emissions, and performance metrics. Would you like me to show you how to access these features?"
      ];
    } else if (lowerMessage.includes('map') || lowerMessage.includes('location') || lowerMessage.includes('live')) {
      return [
        "Our live tracking maps are one of my favorite features! 🗺️",
        "You can see real-time vehicle locations, route progress, and even pause/resume live updates. Have you tried accessing the live map on your tracking page?"
      ];
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return [
        "You're very welcome! It's my pleasure to help! 😊",
        "Is there anything else I can assist you with today? I'm here whenever you need support with our platform."
      ];
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('probability') || lowerMessage.includes('environmental')) {
      return [
        "Great question about our advanced analytics! 📈",
        "Our AI system shows a 94% delivery probability for your shipment, with excellent on-time performance at 87%.",
        "🌱 Environmental Impact: 145kg CO₂ emissions | ⛽ Fuel Efficiency: 8.2 MPG | 🚛 Current Speed: 65 mph",
        "We're also tracking weather conditions (Low impact) and traffic (Moderate). Would you like me to show you the predictive analytics or route optimization suggestions?"
      ];
    } else if (lowerMessage.includes('similar') || lowerMessage.includes('recommend') || lowerMessage.includes('other products')) {
      return [
        "I'd be happy to show you similar products and recommendations! 🎯",
        "Based on your interest, here are our top freight solutions:",
        "🚢 Ocean Express (PRD2001): $1,850 - 7-14 days | ✈️ Air Priority (PRD3001): $3,200 - 2-3 days | 🚛 Ground Standard (PRD1001): $950 - 5-7 days",
        "Each includes real-time tracking, insurance, and our sustainability reporting. Would you like detailed specs for any of these, or shall I generate a custom quote based on your specific needs?"
      ];
    } else if (lowerMessage.includes('quote') || lowerMessage.includes('custom') || lowerMessage.includes('pricing')) {
      return [
        "Perfect! I'll help you get a personalized quote with our AI-powered pricing engine! 💰",
        "I'll need a few details: Origin city, Destination city, Package weight, Dimensions (L×W×H), and Service urgency level.",
        "Our system provides real-time pricing with live market rates, fuel surcharges, and route optimization. Plus, you'll get instant delivery probability and carbon footprint calculations!",
        "You can also use our interactive shipping calculator for instant quotes. Would you like me to guide you through the process or transfer you to our pricing specialist?"
      ];
    } else if (lowerMessage.includes('romeo') || lowerMessage.includes('newton')) {
      return [
        "Yes, that's me! Romeo Newton at your service! 👋",
        "I specialize in technical support and love helping users get the most out of our advanced tracking and analytics features. How can I help you today?"
      ];
    } else if (lowerMessage.includes('yes') || lowerMessage.includes('sure') || lowerMessage.includes('okay') || lowerMessage.includes('please')) {
      return [
        "Excellent! I'm glad you're interested in exploring more features! ✨",
        "Let me show you what I can do: I can provide real-time tracking updates, generate instant quotes, explain our analytics dashboard, troubleshoot technical issues, or help you navigate our platform.",
        "What would you like to dive into first? Just let me know what interests you most!"
      ];
    } else if (lowerMessage.includes('no') || lowerMessage.includes('not now') || lowerMessage.includes('maybe later')) {
      return [
        "No problem at all! I'm here whenever you need assistance. 😊",
        "Feel free to reach out anytime if you have questions about tracking, quotes, technical issues, or want to explore our platform features. Have a great day!"
      ];
    } else {
      console.log('Using default response for:', lowerMessage);
      return [
        "Thanks for reaching out! I'm Romeo Newton from Technical Support. 🤝",
        "I can help with: ✅ Real-time tracking & live maps ✅ Analytics & reports ✅ Technical troubleshooting ✅ Platform features ✅ Quotes & pricing. What would you like to explore?"
      ];
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || isResponding) return;

    const messageContent = newMessage.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    // Prevent duplicate user messages
    setMessages(prev => {
      const recentUserMessages = prev.filter(m => m.sender === 'user').slice(-3);
      const isDuplicate = recentUserMessages.some(m => 
        m.content === messageContent && 
        Date.now() - m.timestamp.getTime() < 2000
      );
      if (isDuplicate) return prev;
      return [...prev, userMessage];
    });
    
    setNewMessage('');
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Show typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, you would start/stop voice recording here
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  console.log('🎨 LiveChat rendering - isOpen:', isOpen, 'unreadCount:', unreadCount);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]" style={{ zIndex: 9999 }}>
        <button
          onClick={() => {
            console.log('🚀 Chat button clicked! Opening chat...');
            setIsOpen(true);
          }}
          className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse border-2 border-white"
          title="Chat with Romeo Newton - Technical Support"
        >
          <MessageCircle className="w-7 h-7" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg">
              {unreadCount}
            </div>
          )}
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
        </button>
        {/* Enhanced debug indicator */}
        <div className="absolute -top-10 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-bounce">
          🤖 Romeo Online
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`} style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            {currentAgent && (
              <>
                <div className="relative">
                  <img
                    src={currentAgent.avatar}
                    alt={currentAgent.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    currentAgent.status === 'online' ? 'bg-green-500' :
                    currentAgent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{currentAgent.name}</h3>
                  <p className="text-xs opacity-90">{currentAgent.department}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-spin' : 'bg-red-400'
            }`}></div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-blue-700 rounded"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {message.sender === 'agent' && (
                      <img
                        src={message.agentAvatar || '/default-avatar.png'}
                        alt="Agent"
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 space-x-2 ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <span className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === 'user' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentAgent?.avatar || '/default-avatar.png'}
                      alt="Agent"
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Paperclip className="w-4 h-4" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                  {isTyping && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="text-xs text-blue-500">typing...</div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isResponding}
                  className={`p-2 text-white rounded-lg transition-colors ${
                    isResponding 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  title={isResponding ? 'Romeo is typing...' : 'Send message'}
                >
                  {isResponding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => !isResponding && setNewMessage('SS123456789')}
                  disabled={isResponding}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors border ${
                    isResponding 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  📦 Try Tracking ID
                </button>
                <button
                  onClick={() => !isResponding && setNewMessage('PRD1001')}
                  disabled={isResponding}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors border ${
                    isResponding 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-orange-200 dark:border-orange-800'
                  }`}
                >
                  🏷️ Try Product ID
                </button>
                <button
                  onClick={() => !isResponding && setNewMessage('I need a custom quote')}
                  disabled={isResponding}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors border ${
                    isResponding 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800'
                  }`}
                >
                  💰 Get quote
                </button>
                <button
                  onClick={() => !isResponding && setNewMessage('Show me delivery probability')}
                  disabled={isResponding}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors border ${
                    isResponding 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800'
                  }`}
                >
                  📊 Live analytics
                </button>
              </div>
              
              {/* Response status indicator */}
              {isResponding && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Romeo Newton is typing...
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
