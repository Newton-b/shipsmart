import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Package,
  Truck,
  Users,
  Globe,
  Zap,
  Brain,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Share,
  Settings,
  Filter,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots } from './AnimatedElements';
import { useNotifications } from '../hooks/useNotifications';

interface PredictiveAnalyticsProps {
  className?: string;
  timeHorizon?: '7d' | '30d' | '90d' | '1y';
}

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  factors: string[];
  unit: string;
  category: 'demand' | 'cost' | 'performance' | 'risk';
}

interface ForecastData {
  timestamp: Date;
  actual?: number;
  predicted: number;
  confidence_upper: number;
  confidence_lower: number;
}

interface RiskAlert {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: 'critical' | 'high' | 'medium' | 'low';
  timeframe: string;
  mitigation: string[];
  category: string;
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  lastTrained: Date;
  dataQuality: number;
}

export const EnhancedPredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  className = "",
  timeHorizon = '30d'
}) => {
  const { createNotification } = useNotifications();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [forecastData, setForecastData] = useState<{[key: string]: ForecastData[]}>({});
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance>({
    accuracy: 87.5,
    precision: 89.2,
    recall: 85.8,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dataQuality: 92.3
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock predictions data
  const mockPredictions: Prediction[] = [
    {
      id: 'pred1',
      metric: 'Shipping Volume',
      currentValue: 1247,
      predictedValue: 1584,
      confidence: 89,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 30 days',
      factors: ['Seasonal trends', 'Market growth', 'New partnerships'],
      unit: 'shipments',
      category: 'demand'
    },
    {
      id: 'pred2',
      metric: 'Fuel Costs',
      currentValue: 45600,
      predictedValue: 52300,
      confidence: 82,
      trend: 'up',
      impact: 'medium',
      timeframe: 'Next 30 days',
      factors: ['Oil prices', 'Seasonal demand', 'Route optimization'],
      unit: 'USD',
      category: 'cost'
    },
    {
      id: 'pred3',
      metric: 'Delivery Success Rate',
      currentValue: 94.8,
      predictedValue: 96.2,
      confidence: 91,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 30 days',
      factors: ['Process improvements', 'Weather patterns', 'Driver training'],
      unit: '%',
      category: 'performance'
    },
    {
      id: 'pred4',
      metric: 'Customer Churn Risk',
      currentValue: 3.2,
      predictedValue: 2.8,
      confidence: 76,
      trend: 'down',
      impact: 'medium',
      timeframe: 'Next 30 days',
      factors: ['Service improvements', 'Competitive pricing', 'Support quality'],
      unit: '%',
      category: 'risk'
    },
    {
      id: 'pred5',
      metric: 'Revenue Growth',
      currentValue: 167000,
      predictedValue: 189500,
      confidence: 85,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 30 days',
      factors: ['Volume increase', 'Price optimization', 'New services'],
      unit: 'USD',
      category: 'demand'
    }
  ];

  const mockRiskAlerts: RiskAlert[] = [
    {
      id: 'risk1',
      title: 'Capacity Shortage Risk',
      description: 'Predicted 15% increase in demand may exceed current capacity by week 3',
      probability: 73,
      impact: 'high',
      timeframe: '2-3 weeks',
      mitigation: [
        'Secure additional carrier partnerships',
        'Optimize route consolidation',
        'Implement dynamic pricing'
      ],
      category: 'Operations'
    },
    {
      id: 'risk2',
      title: 'Weather Disruption Alert',
      description: 'Storm system predicted to impact East Coast operations next week',
      probability: 68,
      impact: 'medium',
      timeframe: '5-7 days',
      mitigation: [
        'Pre-position inventory',
        'Activate alternative routes',
        'Communicate with customers'
      ],
      category: 'Weather'
    }
  ];

  // Generate forecast data
  const generateForecastData = (baseValue: number, trend: 'up' | 'down' | 'stable', days: number = 30) => {
    const data: ForecastData[] = [];
    const now = new Date();
    
    for (let i = 0; i <= days; i++) {
      const timestamp = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      let trendMultiplier = 1;
      
      if (trend === 'up') {
        trendMultiplier = 1 + (i / days) * 0.3; // 30% increase over period
      } else if (trend === 'down') {
        trendMultiplier = 1 - (i / days) * 0.15; // 15% decrease over period
      }
      
      const predicted = baseValue * trendMultiplier * (1 + (Math.random() - 0.5) * 0.1);
      const confidence_range = predicted * 0.15; // ±15% confidence interval
      
      data.push({
        timestamp,
        predicted: Math.round(predicted * 100) / 100,
        confidence_upper: Math.round((predicted + confidence_range) * 100) / 100,
        confidence_lower: Math.round((predicted - confidence_range) * 100) / 100,
        ...(i < 7 ? { actual: baseValue * (1 + (Math.random() - 0.5) * 0.05) } : {})
      });
    }
    
    return data;
  };

  // Initialize data
  useEffect(() => {
    setPredictions(mockPredictions);
    setRiskAlerts(mockRiskAlerts);
    
    // Generate forecast data for each prediction
    const forecasts: {[key: string]: ForecastData[]} = {};
    mockPredictions.forEach(pred => {
      forecasts[pred.id] = generateForecastData(pred.currentValue, pred.trend);
    });
    setForecastData(forecasts);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Update predictions slightly
      setPredictions(prev => prev.map(pred => ({
        ...pred,
        confidence: Math.min(99, Math.max(60, pred.confidence + (Math.random() - 0.5) * 2)),
        predictedValue: pred.predictedValue * (1 + (Math.random() - 0.5) * 0.02)
      })));

      // Update model performance
      setModelPerformance(prev => ({
        ...prev,
        accuracy: Math.min(99, Math.max(80, prev.accuracy + (Math.random() - 0.5) * 1)),
        precision: Math.min(99, Math.max(80, prev.precision + (Math.random() - 0.5) * 1)),
        recall: Math.min(99, Math.max(80, prev.recall + (Math.random() - 0.5) * 1))
      }));

      setLastUpdate(new Date());

      // Occasionally trigger alerts
      if (Math.random() < 0.05) { // 5% chance
        createNotification({
          title: 'Predictive Alert',
          message: 'New risk factor detected in demand forecasting',
          type: 'system_alert'
        });
      }
    }, 8000); // Update every 8 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [createNotification]);

  const handleRefreshPredictions = async () => {
    setIsUpdating(true);
    
    // Simulate model retraining
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update predictions with new values
    setPredictions(prev => prev.map(pred => ({
      ...pred,
      predictedValue: pred.currentValue * (1 + (Math.random() - 0.3) * 0.4),
      confidence: Math.floor(Math.random() * 20) + 75 // 75-95%
    })));
    
    setIsUpdating(false);
    setLastUpdate(new Date());
  };

  const getTrendIcon = (trend: string, size: string = 'w-4 h-4') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className={`${size} text-green-500`} />;
      case 'down':
        return <ArrowDown className={`${size} text-red-500`} />;
      default:
        return <Minus className={`${size} text-gray-500`} />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'demand': return Package;
      case 'cost': return DollarSign;
      case 'performance': return Target;
      case 'risk': return AlertTriangle;
      default: return BarChart3;
    }
  };

  const renderMiniChart = (data: ForecastData[]) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => Math.max(d.predicted, d.confidence_upper)));
    const minValue = Math.min(...data.map(d => Math.min(d.predicted, d.confidence_lower)));
    const range = maxValue - minValue || 1;

    return (
      <div className="flex items-end space-x-1 h-16 w-full">
        {data.slice(0, 15).map((point, index) => {
          const height = ((point.predicted - minValue) / range) * 100;
          const upperHeight = ((point.confidence_upper - minValue) / range) * 100;
          const lowerHeight = ((point.confidence_lower - minValue) / range) * 100;
          
          return (
            <div key={index} className="flex-1 relative">
              {showConfidenceIntervals && (
                <div
                  className="absolute bottom-0 w-full bg-blue-200 dark:bg-blue-800 opacity-30"
                  style={{ height: `${Math.max(upperHeight - lowerHeight, 2)}%`, bottom: `${lowerHeight}%` }}
                />
              )}
              <div
                className="absolute bottom-0 w-full bg-blue-500 rounded-sm"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              {point.actual && (
                <div
                  className="absolute bottom-0 w-full bg-green-500 rounded-sm"
                  style={{ height: `${Math.max(((point.actual - minValue) / range) * 100, 2)}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredPredictions = predictions.filter(pred => 
    selectedCategory === 'all' || pred.category === selectedCategory
  );

  const categories = ['all', 'demand', 'cost', 'performance', 'risk'];

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-xl shadow-lg`}>
      {/* Mobile-First Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Predictive Analytics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered forecasting and risk analysis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConfidenceIntervals(!showConfidenceIntervals)}
              className={`p-2 rounded-lg transition-colors ${
                showConfidenceIntervals
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showConfidenceIntervals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleRefreshPredictions}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? (
                <>
                  <PulsingDots />
                  <span className="hidden sm:inline">Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Model Performance Status */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Model Performance
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last trained: {modelPerformance.lastTrained.toLocaleDateString()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                <AnimatedCounter value={modelPerformance.accuracy} suffix="%" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                <AnimatedCounter value={modelPerformance.precision} suffix="%" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Precision</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                <AnimatedCounter value={modelPerformance.recall} suffix="%" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Recall</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                <AnimatedCounter value={modelPerformance.dataQuality} suffix="%" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Data Quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts Section */}
      {riskAlerts.length > 0 && (
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Risk Alerts</span>
          </h3>
          
          <div className="space-y-3">
            {riskAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(alert.impact)}`}>
                        {alert.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {alert.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Timeframe: {alert.timeframe}
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-right">
                    <div className="text-xl font-bold text-orange-600">
                      <AnimatedCounter value={alert.probability} suffix="%" />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Probability
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPredictions.map(prediction => {
            const CategoryIcon = getCategoryIcon(prediction.category);
            const change = ((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100;
            
            return (
              <div
                key={prediction.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {prediction.metric}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {prediction.timeframe}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(prediction.trend)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                      {prediction.impact}
                    </span>
                  </div>
                </div>

                {/* Current vs Predicted */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      <AnimatedCounter value={prediction.currentValue} suffix={prediction.unit === '%' ? '%' : ''} />
                      {prediction.unit !== '%' && prediction.unit !== 'shipments' && (
                        <span className="text-sm text-gray-500 ml-1">{prediction.unit}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      prediction.trend === 'up' ? 'text-green-600' : 
                      prediction.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <AnimatedCounter value={prediction.predictedValue} suffix={prediction.unit === '%' ? '%' : ''} />
                      {prediction.unit !== '%' && prediction.unit !== 'shipments' && (
                        <span className="text-sm text-gray-500 ml-1">{prediction.unit}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Predicted</div>
                  </div>
                </div>

                {/* Change Percentage */}
                <div className="text-center mb-4">
                  <div className={`text-lg font-semibold flex items-center justify-center space-x-1 ${
                    change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getTrendIcon(prediction.trend, 'w-4 h-4')}
                    <span>{Math.abs(change).toFixed(1)}% {change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'}</span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Confidence</span>
                    <span>{prediction.confidence}%</span>
                  </div>
                  <AnimatedProgressBar progress={prediction.confidence} color="bg-blue-500" />
                </div>

                {/* Mini Chart */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    30-Day Forecast
                  </div>
                  {renderMiniChart(forecastData[prediction.id] || [])}
                </div>

                {/* Key Factors */}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Key Factors
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.slice(0, 3).map((factor, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPredictions.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No predictions available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try selecting a different category or refresh the predictions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
