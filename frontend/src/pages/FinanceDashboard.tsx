import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Play,
  Pause,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { AnimatedCounter, AnimatedProgressBar } from '../components/AnimatedElements';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'refund';
  amount: number;
  description: string;
  category: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  customerName?: string;
  invoiceId?: string;
}

interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: Date;
  createdDate: Date;
  services: string[];
}

const FinanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'reports'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [financeStats, setFinanceStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overdueInvoices: 0,
    profitMargin: 0,
    totalTransactions: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data
  const mockTransactions: Transaction[] = [
    {
      id: 'txn-001',
      type: 'income',
      amount: 2450.00,
      description: 'Freight service - ABC Corp',
      category: 'Shipping Revenue',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      customerName: 'ABC Corp',
      invoiceId: 'INV-001'
    },
    {
      id: 'txn-002',
      type: 'expense',
      amount: 850.00,
      description: 'Fuel costs - Fleet maintenance',
      category: 'Operations',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'completed'
    }
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'INV-001',
      customerName: 'ABC Corp',
      amount: 2450.00,
      status: 'paid',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      services: ['International Shipping', 'Customs Clearance']
    },
    {
      id: 'INV-002',
      customerName: 'XYZ Ltd',
      amount: 1200.00,
      status: 'pending',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      services: ['Express Delivery', 'Insurance']
    }
  ];

  useEffect(() => {
    setTransactions(mockTransactions);
    setInvoices(mockInvoices);
    setFinanceStats({
      totalRevenue: 125750.00,
      monthlyRevenue: 28450.00,
      pendingPayments: 4650.00,
      overdueInvoices: 3200.00,
      profitMargin: 23.5,
      totalTransactions: 156
    });
  }, []);

  // Real-time updates
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        if (Math.random() < 0.1) {
          createNotification({
            title: 'Financial Update',
            message: 'New payment received',
            type: 'system_alert'
          });
        }
      }, 8000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveMode, createNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
      case 'failed': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'refund': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Finance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Monitor financial performance and manage billing
          </p>
        </div>

        {/* Live Status Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Live Financial Data {isLiveMode ? 'Active' : 'Paused'}
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
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <DollarSign className="w-4 h-4" />
                <span>${financeStats.totalRevenue.toLocaleString()} total revenue</span>
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={Math.round(financeStats.totalRevenue)} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={Math.round(financeStats.monthlyRevenue)} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={Math.round(financeStats.pendingPayments)} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={Math.round(financeStats.overdueInvoices)} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <PieChart className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={Math.round(financeStats.profitMargin * 10) / 10} />%
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Receipt className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={financeStats.totalTransactions} />
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
                { id: 'overview', label: 'Financial Overview', icon: BarChart3 },
                { id: 'transactions', label: 'Transactions', icon: Receipt },
                { id: 'invoices', label: 'Invoices', icon: FileText },
                { id: 'reports', label: 'Reports', icon: PieChart }
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
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Revenue Trends</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {[65, 78, 82, 90, 85, 92, 88].map((height, index) => (
                      <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }}>
                        <div className="w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Expense Categories</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Fuel & Operations</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <AnimatedProgressBar progress={42} color="bg-red-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Staff & Payroll</span>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                      <AnimatedProgressBar progress={28} color="bg-yellow-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Maintenance</span>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                      <AnimatedProgressBar progress={18} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Other</span>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                      <AnimatedProgressBar progress={12} color="bg-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm text-green-600 dark:text-green-400">Paid Invoices</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {invoices.filter(i => i.status === 'paid').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending Invoices</p>
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                        {invoices.filter(i => i.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600 dark:text-red-400">Overdue Invoices</p>
                      <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                        {invoices.filter(i => i.status === 'overdue').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.customerName && `${transaction.customerName} • `}
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {transaction.date.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Invoice Management</h2>
              
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{invoice.id}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${invoice.amount.toLocaleString()}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium">{invoice.createdDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="text-sm font-medium">{invoice.dueDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Services</p>
                        <p className="text-sm font-medium">{invoice.services.length} items</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Days Remaining</p>
                        <p className="text-sm font-medium">
                          {Math.floor((invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        View
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                        Download
                      </button>
                      {invoice.status === 'pending' && (
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Financial Reports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Revenue Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Q1 Performance</span>
                        <span className="text-sm font-medium">+15.2%</span>
                      </div>
                      <AnimatedProgressBar progress={85} color="bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Q2 Target</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <AnimatedProgressBar progress={78} color="bg-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Key Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Invoice Value</span>
                      <span className="text-sm font-medium">$2,150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Collection Rate</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Sales Outstanding</span>
                      <span className="text-sm font-medium">28 days</span>
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

export default FinanceDashboard;
