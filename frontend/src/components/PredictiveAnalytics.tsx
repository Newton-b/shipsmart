import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Truck,
  Ship,
  Plane,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar } from './AnimatedElements';

interface Prediction {
  id: string;
  type: 'demand' | 'delay' | 'cost' | 'capacity' | 'route' | 'weather';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  recommendation: string;
  dataPoints: number;
  lastUpdated: Date;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  prediction: number;
  accuracy: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    predicted: number[];
    color: string;
  }[];
}

export const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock predictions data
  useEffect(() => {
    const mockPredictions: Prediction[] = [
      {
        id: 'pred-001',
        type: 'demand',
        title: 'Electronics Demand Surge',
        description: 'Predicted 35% increase in electronics shipments from Asia to North America',
        confidence: 87,
        impact: 'high',
        timeframe: 'Next 14 days',
        value: 35,
        trend: 'up',
        category: 'Market Trends',
        recommendation: 'Increase container capacity allocation for electronics routes',
        dataPoints: 15420,
        lastUpdated: new Date()
      },
      {
        id: 'pred-002',
        type: 'delay',
        title: 'Port Congestion Alert',
        description: 'Los Angeles port expected to experience 2-3 day delays due to increased volume',
        confidence: 92,
        impact: 'critical',
        timeframe: 'Next 7 days',
        value: 2.5,
        trend: 'up',
        category: 'Operations',
        recommendation: 'Consider rerouting shipments through Oakland or Long Beach ports',
        dataPoints: 8750,
        lastUpdated: new Date()
      },
      {
        id: 'pred-003',
        type: 'cost',
        title: 'Fuel Cost Optimization',
        description: 'Predicted 12% reduction in fuel costs through route optimization',
        confidence: 78,
        impact: 'medium',
        timeframe: 'Next 30 days',
        value: 12,
        trend: 'down',
        category: 'Cost Optimization',
        recommendation: 'Implement AI-driven route optimization for all ocean freight',
        dataPoints: 22100,
        lastUpdated: new Date()
      },
      {
        id: 'pred-004',
        type: 'weather',
        title: 'Atlantic Storm Impact',
        description: 'Severe weather system may affect 15% of Atlantic shipping routes',
        confidence: 94,
        impact: 'high',
        timeframe: 'Next 5 days',
        value: 15,
        trend: 'up',
        category: 'Weather & Climate',
        recommendation: 'Activate contingency routes and notify affected customers',
        dataPoints: 5200,
        lastUpdated: new Date()
      },
      {
        id: 'pred-005',
        type: 'capacity',
        title: 'Warehouse Utilization',
        description: 'Chicago warehouse predicted to reach 95% capacity within 10 days',
        confidence: 89,
        impact: 'high',
        timeframe: 'Next 10 days',
        value: 95,
        trend: 'up',
        category: 'Capacity Planning',
        recommendation: 'Expedite outbound shipments or secure additional storage',
        dataPoints: 12800,
        lastUpdated: new Date()
      },
      {
        id: 'pred-006',
        type: 'route',
        title: 'Route Efficiency Gain',
        description: 'New AI-optimized routes show 18% time reduction for Europe-Asia corridor',
        confidence: 85,
        impact: 'medium',
        timeframe: 'Implementation ready',
        value: 18,
        trend: 'down',
        category: 'Route Optimization',
        recommendation: 'Deploy optimized routes for trial period with select customers',
        dataPoints: 18500,
        lastUpdated: new Date()
      }
    ];

    const mockMetrics: AnalyticsMetric[] = [
      {
        id: 'metric-001',
        name: 'On-Time Delivery',
        value: 94.2,
        previousValue: 92.8,
        unit: '%',
        change: 1.4,
        trend: 'up',
        prediction: 95.1,
        accuracy: 91
      },
      {
        id: 'metric-002',
        name: 'Average Transit Time',
        value: 12.5,
        previousValue: 13.2,
        unit: 'days',
        change: -0.7,
        trend: 'down',
        prediction: 11.8,
        accuracy: 88
      },
      {
        id: 'metric-003',
        name: 'Cost per Container',
        value: 2850,
        previousValue: 2920,
        unit: '$',
        change: -70,
        trend: 'down',
        prediction: 2780,
        accuracy: 85
      },
      {
        id: 'metric-004',
        name: 'Customer Satisfaction',
        value: 4.6,
        previousValue: 4.4,
        unit: '/5',
        change: 0.2,
        trend: 'up',
        prediction: 4.7,
        accuracy: 92
      }
    ];

    const mockChartData: ChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Actual Volume',
          data: [1200, 1350, 1180, 1420, 1650, 1580, 1720, 1890, 1750, 1920, 2100, 2050],
          predicted: [1250, 1400, 1200, 1450, 1680, 1600, 1750, 1920, 1780, 1950, 2150, 2100],
          color: '#3b82f6'
        },
        {
          label: 'Predicted Volume',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          predicted: [2200, 2350, 2180, 2420, 2650, 2580, 2720, 2890, 2750, 2920, 3100, 3050],
          color: '#10b981'
        }
      ]
    };

    setPredictions(mockPredictions);
    setMetrics(mockMetrics);
    setChartData(mockChartData);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPredictions(prev => prev.map(pred => ({
        ...pred,
        confidence: Math.max(70, Math.min(99, pred.confidence + (Math.random() - 0.5) * 2)),
        lastUpdated: new Date()
      })));

      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 0.5,
        accuracy: Math.max(80, Math.min(99, metric.accuracy + (Math.random() - 0.5) * 1))
      })));

      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredPredictions = predictions.filter(pred => 
    selectedCategory === 'all' || pred.category === selectedCategory
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'demand': return <TrendingUp className="w-5 h-5" />;
      case 'delay': return <Clock className="w-5 h-5" />;
      case 'cost': return <DollarSign className="w-5 h-5" />;
      case 'capacity': return <Package className="w-5 h-5" />;
      case 'route': return <Truck className="w-5 h-5" />;
      case 'weather': return <Activity className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const categories = Array.from(new Set(predictions.map(p => p.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>Predictive Analytics</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered insights and predictions for optimal logistics decisions
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</h3>
              {getTrendIcon(metric.trend)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.unit}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className={`${metric.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}{metric.unit}
                </span>
                <span className="text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Prediction Accuracy</span>
                  <span>{metric.accuracy}%</span>
                </div>
                <AnimatedProgressBar progress={metric.accuracy} showLabel={false} />
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Next period forecast:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.prediction.toFixed(1)}{metric.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Active Predictions</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getImpactColor(prediction.impact)}`}>
                      {getPredictionIcon(prediction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{prediction.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.timeframe}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                      {prediction.impact}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {prediction.confidence}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">confidence</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {prediction.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>{prediction.dataPoints.toLocaleString()} data points</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{prediction.lastUpdated.toLocaleTimeString()}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(prediction.trend)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {prediction.value}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Recommendation:</strong> {prediction.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="space-y-6">
          {/* Model Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Model Performance</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Overall Accuracy</span>
                  <span className="font-medium text-gray-900 dark:text-white">89.2%</span>
                </div>
                <AnimatedProgressBar progress={89.2} showLabel={false} color="bg-green-600" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Demand Prediction</span>
                  <span className="font-medium text-gray-900 dark:text-white">92.1%</span>
                </div>
                <AnimatedProgressBar progress={92.1} showLabel={false} color="bg-blue-600" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Delay Forecasting</span>
                  <span className="font-medium text-gray-900 dark:text-white">87.5%</span>
                </div>
                <AnimatedProgressBar progress={87.5} showLabel={false} color="bg-purple-600" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Cost Optimization</span>
                  <span className="font-medium text-gray-900 dark:text-white">85.8%</span>
                </div>
                <AnimatedProgressBar progress={85.8} showLabel={false} color="bg-orange-600" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Quick Stats</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Predictions</span>
                <AnimatedCounter value={filteredPredictions.length} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">High Impact Alerts</span>
                <AnimatedCounter value={filteredPredictions.filter(p => p.impact === 'high' || p.impact === 'critical').length} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Confidence</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Data Points</span>
                <AnimatedCounter value={filteredPredictions.reduce((sum, p) => sum + p.dataPoints, 0)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
