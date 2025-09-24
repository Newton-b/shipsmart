import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap, 
  Star, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Bookmark,
  Share,
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  Truck,
  Package,
  Users,
  BarChart3,
  Activity,
  Settings,
  Filter
} from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots } from './AnimatedElements';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

interface AIRecommendationsProps {
  className?: string;
  context?: 'dashboard' | 'shipping' | 'analytics' | 'operations';
}

interface Recommendation {
  id: string;
  type: 'cost_optimization' | 'route_efficiency' | 'customer_satisfaction' | 'operational_improvement' | 'predictive_insight';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  potentialSavings?: number;
  timeToImplement: string;
  category: string;
  priority: number;
  actionItems: string[];
  metrics?: {
    current: number;
    projected: number;
    unit: string;
  };
  isBookmarked?: boolean;
  feedback?: 'helpful' | 'not_helpful';
  implementationStatus?: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  dataPoints: Array<{
    label: string;
    value: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
}

export const AISmartRecommendations: React.FC<AIRecommendationsProps> = ({
  className = "",
  context = 'dashboard'
}) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'confidence' | 'savings'>('priority');
  const [showImplemented, setShowImplemented] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock AI recommendations data
  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec1',
      type: 'cost_optimization',
      title: 'Optimize Route Consolidation',
      description: 'AI analysis shows 23% cost reduction potential by consolidating shipments on the LA-NYC route during off-peak hours.',
      impact: 'high',
      confidence: 87,
      potentialSavings: 12500,
      timeToImplement: '2-3 weeks',
      category: 'Logistics',
      priority: 1,
      actionItems: [
        'Analyze current LA-NYC shipment patterns',
        'Negotiate off-peak pricing with carriers',
        'Implement automated consolidation rules',
        'Monitor performance for 30 days'
      ],
      metrics: {
        current: 45000,
        projected: 32500,
        unit: 'monthly cost'
      },
      implementationStatus: 'not_started',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'rec2',
      type: 'customer_satisfaction',
      title: 'Proactive Delivery Notifications',
      description: 'Implement AI-powered predictive notifications to reduce customer inquiries by 40% and improve satisfaction scores.',
      impact: 'high',
      confidence: 92,
      potentialSavings: 8500,
      timeToImplement: '1-2 weeks',
      category: 'Customer Service',
      priority: 2,
      actionItems: [
        'Set up predictive delivery windows',
        'Configure automated SMS/email alerts',
        'Train customer service team',
        'A/B test notification timing'
      ],
      metrics: {
        current: 3.8,
        projected: 4.5,
        unit: 'satisfaction score'
      },
      implementationStatus: 'in_progress',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: 'rec3',
      type: 'operational_improvement',
      title: 'Dynamic Pricing Strategy',
      description: 'Machine learning model suggests implementing dynamic pricing based on demand patterns could increase revenue by 15%.',
      impact: 'medium',
      confidence: 78,
      potentialSavings: 25000,
      timeToImplement: '4-6 weeks',
      category: 'Pricing',
      priority: 3,
      actionItems: [
        'Analyze historical pricing data',
        'Develop ML pricing model',
        'Test with select customers',
        'Roll out gradually'
      ],
      metrics: {
        current: 167000,
        projected: 192000,
        unit: 'monthly revenue'
      },
      implementationStatus: 'not_started',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'rec4',
      type: 'predictive_insight',
      title: 'Preventive Maintenance Alert',
      description: 'Vehicle telemetry data indicates 3 trucks need maintenance within 2 weeks to prevent potential breakdowns.',
      impact: 'medium',
      confidence: 94,
      potentialSavings: 5500,
      timeToImplement: 'Immediate',
      category: 'Fleet Management',
      priority: 4,
      actionItems: [
        'Schedule maintenance for vehicles #147, #203, #089',
        'Order replacement parts',
        'Arrange backup vehicles',
        'Update maintenance schedules'
      ],
      implementationStatus: 'not_started',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];

  const mockInsights: AIInsight[] = [
    {
      id: 'insight1',
      title: 'Shipping Volume Surge Detected',
      description: 'AI models predict 35% increase in shipping volume next week based on seasonal patterns and market indicators.',
      type: 'trend',
      severity: 'info',
      confidence: 89,
      dataPoints: [
        { label: 'Current Volume', value: 1247, trend: 'up' },
        { label: 'Predicted Volume', value: 1684, trend: 'up' },
        { label: 'Capacity Utilization', value: 78, trend: 'up' }
      ]
    },
    {
      id: 'insight2',
      title: 'Delivery Delay Risk',
      description: 'Weather patterns and traffic data suggest potential delays on East Coast routes this weekend.',
      type: 'risk',
      severity: 'warning',
      confidence: 82,
      dataPoints: [
        { label: 'Affected Routes', value: 12, trend: 'up' },
        { label: 'Delay Risk', value: 67, trend: 'up' },
        { label: 'Alternative Routes', value: 8, trend: 'stable' }
      ]
    }
  ];

  // Initialize data
  useEffect(() => {
    setRecommendations(mockRecommendations);
    setInsights(mockInsights);
  }, []);

  // Simulate AI processing and updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Simulate new recommendations occasionally
      if (Math.random() < 0.1) { // 10% chance
        generateNewRecommendation();
      }

      // Update confidence scores slightly
      setRecommendations(prev => prev.map(rec => ({
        ...rec,
        confidence: Math.min(99, Math.max(50, rec.confidence + (Math.random() - 0.5) * 2))
      })));

      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const generateNewRecommendation = () => {
    const newRecommendations = [
      {
        type: 'route_efficiency' as const,
        title: 'Alternative Route Optimization',
        description: 'New traffic pattern analysis suggests a 12% time reduction on Chicago-Detroit route.',
        category: 'Logistics',
        potentialSavings: 3200
      },
      {
        type: 'cost_optimization' as const,
        title: 'Carrier Rate Negotiation',
        description: 'Market analysis indicates opportunity to renegotiate rates with Carrier XYZ for 8% savings.',
        category: 'Procurement',
        potentialSavings: 15600
      },
      {
        type: 'operational_improvement' as const,
        title: 'Warehouse Efficiency Boost',
        description: 'AI suggests reorganizing warehouse layout could reduce picking time by 18%.',
        category: 'Operations',
        potentialSavings: 7800
      }
    ];

    const template = newRecommendations[Math.floor(Math.random() * newRecommendations.length)];
    const newRec: Recommendation = {
      id: `rec_${Date.now()}`,
      ...template,
      impact: 'medium' as const,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
      timeToImplement: '2-4 weeks',
      priority: recommendations.length + 1,
      actionItems: [
        'Analyze current performance metrics',
        'Develop implementation plan',
        'Test with pilot program',
        'Monitor and optimize'
      ],
      implementationStatus: 'not_started' as const,
      createdAt: new Date()
    };

    setRecommendations(prev => [newRec, ...prev]);
    
    createNotification({
      title: 'New AI Recommendation',
      message: newRec.title,
      type: 'system_alert'
    });
  };

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    generateNewRecommendation();
    setIsGenerating(false);
  };

  const handleBookmark = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, isBookmarked: !rec.isBookmarked } : rec
    ));
  };

  const handleFeedback = (id: string, feedback: 'helpful' | 'not_helpful') => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, feedback } : rec
    ));
  };

  const handleImplementationStatus = (id: string, status: Recommendation['implementationStatus']) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, implementationStatus: status } : rec
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost_optimization': return DollarSign;
      case 'route_efficiency': return Truck;
      case 'customer_satisfaction': return Users;
      case 'operational_improvement': return Settings;
      case 'predictive_insight': return Brain;
      default: return Lightbulb;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const filteredRecommendations = recommendations
    .filter(rec => selectedCategory === 'all' || rec.category === selectedCategory)
    .filter(rec => showImplemented || rec.implementationStatus !== 'completed')
    .sort((a, b) => {
      switch (sortBy) {
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        case 'confidence':
          return b.confidence - a.confidence;
        case 'savings':
          return (b.potentialSavings || 0) - (a.potentialSavings || 0);
        default:
          return a.priority - b.priority;
      }
    });

  const categories = ['all', ...Array.from(new Set(recommendations.map(r => r.category)))];

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-xl shadow-lg`}>
      {/* Mobile-First Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Recommendations
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart insights powered by machine learning
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <PulsingDots />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Generate New</span>
              </>
            )}
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span>AI Active</span>
            </div>
            <div>Last updated: {lastUpdate.toLocaleTimeString()}</div>
          </div>
          <div className="text-sm text-gray-500">
            <AnimatedCounter value={filteredRecommendations.length} /> recommendations
          </div>
        </div>
      </div>

      {/* Mobile-Responsive Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="priority">Sort by Priority</option>
            <option value="impact">Sort by Impact</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="savings">Sort by Savings</option>
          </select>

          {/* Show Implemented Toggle */}
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showImplemented}
              onChange={(e) => setShowImplemented(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span>Show Implemented</span>
          </label>
        </div>
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Live AI Insights
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div
                key={insight.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                    {insight.severity}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  {insight.dataPoints.map((point, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter value={point.value} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {point.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Confidence: {insight.confidence}%
                  </div>
                  <AnimatedProgressBar progress={insight.confidence} color="bg-purple-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {filteredRecommendations.map(recommendation => {
            const TypeIcon = getTypeIcon(recommendation.type);
            
            return (
              <div
                key={recommendation.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {recommendation.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                            {recommendation.impact} impact
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {recommendation.description}
                        </p>
                        
                        {/* Metrics */}
                        {recommendation.metrics && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                <AnimatedCounter value={recommendation.metrics.current} />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Current {recommendation.metrics.unit}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                <AnimatedCounter value={recommendation.metrics.projected} />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Projected {recommendation.metrics.unit}
                              </div>
                            </div>
                            <div className="text-center col-span-2 sm:col-span-1">
                              <div className="text-lg font-bold text-purple-600">
                                {recommendation.confidence}%
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Confidence
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Action Items */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Action Items:
                          </h4>
                          <ul className="space-y-1">
                            {recommendation.actionItems.slice(0, 3).map((item, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Side Info */}
                  <div className="flex flex-col sm:items-end space-y-3">
                    {recommendation.potentialSavings && (
                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-bold text-green-600">
                          $<AnimatedCounter value={recommendation.potentialSavings} />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Potential Savings
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center sm:text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {recommendation.timeToImplement}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Implementation Time
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 gap-2">
                  <div className="flex items-center space-x-2">
                    <select
                      value={recommendation.implementationStatus || 'not_started'}
                      onChange={(e) => handleImplementationStatus(recommendation.id, e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBookmark(recommendation.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        recommendation.isBookmarked
                          ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(recommendation.id, 'helpful')}
                      className={`p-2 rounded-lg transition-colors ${
                        recommendation.feedback === 'helpful'
                          ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(recommendation.id, 'not_helpful')}
                      className={`p-2 rounded-lg transition-colors ${
                        recommendation.feedback === 'not_helpful'
                          ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or generate new recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
