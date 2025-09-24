import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Users,
  Activity,
  Search,
  Filter,
  Send,
  Paperclip,
  MoreVertical,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { AnimatedCounter, AnimatedProgressBar } from '../components/AnimatedElements';

interface Ticket {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  category: 'tracking' | 'billing' | 'delivery' | 'technical' | 'general';
  createdAt: Date;
  lastUpdate: Date;
  messages: Message[];
  assignedTo?: string;
}

interface Message {
  id: string;
  sender: 'customer' | 'agent';
  content: string;
  timestamp: Date;
  type: 'text' | 'attachment';
}

const CustomerServiceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'tickets' | 'chat' | 'analytics' | 'knowledge'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceStats, setServiceStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0,
    activeChats: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock ticket data
  const mockTickets: Ticket[] = [
    {
      id: 'tkt-001',
      customerName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      subject: 'Package delivery delay',
      status: 'open',
      priority: 'high',
      category: 'delivery',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
      messages: [
        {
          id: 'msg-001',
          sender: 'customer',
          content: 'My package was supposed to arrive yesterday but I haven\'t received it yet. Can you help me track it?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text'
        }
      ],
      assignedTo: user?.firstName
    },
    {
      id: 'tkt-002',
      customerName: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+1 (555) 987-6543',
      subject: 'Billing inquiry about invoice #12345',
      status: 'in_progress',
      priority: 'medium',
      category: 'billing',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
      messages: [
        {
          id: 'msg-002',
          sender: 'customer',
          content: 'I have a question about the charges on my recent invoice. Some items don\'t look familiar.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          type: 'text'
        },
        {
          id: 'msg-003',
          sender: 'agent',
          content: 'I\'ll review your invoice and get back to you with details about each charge.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: 'text'
        }
      ],
      assignedTo: user?.firstName
    }
  ];

  useEffect(() => {
    setTickets(mockTickets);
    setServiceStats({
      totalTickets: 45,
      openTickets: 12,
      resolvedToday: 23,
      avgResponseTime: 8.5,
      customerSatisfaction: 4.7,
      activeChats: 5
    });
  }, []);

  // Real-time updates
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        if (Math.random() < 0.1) {
          createNotification({
            title: 'New Support Ticket',
            message: 'A new customer inquiry has been received',
            type: 'system_alert'
          });
        }
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveMode, createNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tracking': return <Search className="w-4 h-4" />;
      case 'billing': return <Mail className="w-4 h-4" />;
      case 'delivery': return <Clock className="w-4 h-4" />;
      case 'technical': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const ticket = tickets.find(t => t.id === selectedTicket);
    if (ticket) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        content: newMessage,
        timestamp: new Date(),
        type: 'text'
      };

      setTickets(prev => prev.map(t => 
        t.id === selectedTicket 
          ? { ...t, messages: [...t.messages, message], lastUpdate: new Date() }
          : t
      ));

      setNewMessage('');
      createNotification({
        title: 'Message Sent',
        message: `Reply sent to ${ticket.customerName}`,
        type: 'system_alert'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customer Service Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Manage customer inquiries and support tickets
          </p>
        </div>

        {/* Live Status Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Live Support {isLiveMode ? 'Active' : 'Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-sm">{isLiveMode ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span>{serviceStats.activeChats} active chats</span>
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={serviceStats.totalTickets} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={serviceStats.openTickets} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={serviceStats.resolvedToday} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response (min)</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={Math.round(serviceStats.avgResponseTime * 10) / 10} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={Math.round(serviceStats.customerSatisfaction * 10) / 10} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Chats</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={serviceStats.activeChats} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
                { id: 'chat', label: 'Live Chat', icon: Phone },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'knowledge', label: 'Knowledge Base', icon: Search }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {activeTab === 'tickets' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTicket === ticket.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(ticket.category)}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.customerName}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ticket.subject}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{ticket.category}</span>
                      <span>{ticket.lastUpdate.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Interface */}
              {selectedTicket && (
                <div className="mt-6 border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Reply to Ticket</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Support Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">First Response Time</span>
                        <span className="text-sm font-medium">8.5 min</span>
                      </div>
                      <AnimatedProgressBar progress={85} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Resolution Rate</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <AnimatedProgressBar progress={94} color="bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Customer Satisfaction</span>
                        <span className="text-sm font-medium">4.7/5.0</span>
                      </div>
                      <AnimatedProgressBar progress={94} color="bg-purple-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Ticket Categories</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Issues</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tracking Problems</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Billing Questions</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Technical Issues</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;
