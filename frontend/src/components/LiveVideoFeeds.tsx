import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Eye,
  Users,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  AlertTriangle,
  Camera,
  Monitor,
  Zap,
  Activity
} from 'lucide-react';

interface VideoFeed {
  id: string;
  name: string;
  location: string;
  type: 'port' | 'warehouse' | 'vessel' | 'truck' | 'gate';
  status: 'live' | 'offline' | 'maintenance' | 'recording';
  quality: '720p' | '1080p' | '4K';
  viewers: number;
  lastActivity: Date;
  thumbnailUrl: string;
  streamUrl: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  isRecording: boolean;
  hasAudio: boolean;
  nightVision: boolean;
  weatherCondition?: string;
}

interface ViewerStats {
  totalViewers: number;
  peakViewers: number;
  averageViewTime: number;
  totalWatchTime: number;
}

export const LiveVideoFeeds: React.FC = () => {
  const [videoFeeds, setVideoFeeds] = useState<VideoFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<VideoFeed | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [quality, setQuality] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewerStats, setViewerStats] = useState<ViewerStats>({
    totalViewers: 0,
    peakViewers: 0,
    averageViewTime: 0,
    totalWatchTime: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenRef = useRef<HTMLDivElement | null>(null);

  // Mock video feeds data
  useEffect(() => {
    const mockFeeds: VideoFeed[] = [
      {
        id: 'feed-001',
        name: 'Port of New York - Main Gate',
        location: 'New York, NY',
        type: 'port',
        status: 'live',
        quality: '1080p',
        viewers: 45,
        lastActivity: new Date(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        streamUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        description: 'Live view of container operations at the main entrance',
        isRecording: true,
        hasAudio: true,
        nightVision: true,
        weatherCondition: 'Clear'
      },
      {
        id: 'feed-002',
        name: 'Shanghai Port - Container Yard',
        location: 'Shanghai, China',
        type: 'port',
        status: 'live',
        quality: '4K',
        viewers: 128,
        lastActivity: new Date(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        streamUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        coordinates: { lat: 31.2304, lng: 121.4737 },
        description: 'Container loading and unloading operations',
        isRecording: true,
        hasAudio: false,
        nightVision: true,
        weatherCondition: 'Foggy'
      },
      {
        id: 'feed-003',
        name: 'LA Warehouse - Loading Dock',
        location: 'Los Angeles, CA',
        type: 'warehouse',
        status: 'live',
        quality: '1080p',
        viewers: 32,
        lastActivity: new Date(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400',
        streamUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        description: 'Real-time warehouse operations and inventory management',
        isRecording: false,
        hasAudio: true,
        nightVision: false,
        weatherCondition: 'Sunny'
      },
      {
        id: 'feed-004',
        name: 'MSC Vessel - Bridge Cam',
        location: 'Atlantic Ocean',
        type: 'vessel',
        status: 'live',
        quality: '720p',
        viewers: 89,
        lastActivity: new Date(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
        streamUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        coordinates: { lat: 45.0, lng: -30.0 },
        description: 'Live feed from container ship bridge during transit',
        isRecording: true,
        hasAudio: true,
        nightVision: false,
        weatherCondition: 'Stormy'
      },
      {
        id: 'feed-005',
        name: 'Chicago Hub - Security Gate',
        location: 'Chicago, IL',
        type: 'gate',
        status: 'offline',
        quality: '1080p',
        viewers: 0,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        streamUrl: '',
        coordinates: { lat: 41.8781, lng: -87.6298 },
        description: 'Security checkpoint monitoring - Currently offline',
        isRecording: false,
        hasAudio: false,
        nightVision: true,
        weatherCondition: 'Rainy'
      },
      {
        id: 'feed-006',
        name: 'Delivery Truck - Route 95',
        location: 'Interstate 95, FL',
        type: 'truck',
        status: 'live',
        quality: '720p',
        viewers: 15,
        lastActivity: new Date(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400',
        streamUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        coordinates: { lat: 26.1224, lng: -80.1373 },
        description: 'Live dashboard cam from delivery truck',
        isRecording: true,
        hasAudio: true,
        nightVision: false,
        weatherCondition: 'Clear'
      }
    ];

    setVideoFeeds(mockFeeds);
    setSelectedFeed(mockFeeds[0]);

    // Initialize viewer stats
    setViewerStats({
      totalViewers: mockFeeds.reduce((sum, feed) => sum + feed.viewers, 0),
      peakViewers: Math.max(...mockFeeds.map(feed => feed.viewers)) + 50,
      averageViewTime: 4.5,
      totalWatchTime: 1250
    });
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVideoFeeds(prev => prev.map(feed => ({
        ...feed,
        viewers: Math.max(0, feed.viewers + Math.floor(Math.random() * 10) - 5),
        lastActivity: feed.status === 'live' ? new Date() : feed.lastActivity
      })));

      // Update viewer stats
      setViewerStats(prev => ({
        ...prev,
        totalViewers: videoFeeds.reduce((sum, feed) => sum + feed.viewers, 0),
        totalWatchTime: prev.totalWatchTime + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [videoFeeds]);

  const filteredFeeds = videoFeeds.filter(feed => {
    const matchesType = filterType === 'all' || feed.type === filterType;
    const matchesStatus = filterStatus === 'all' || feed.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const handleFeedSelect = (feed: VideoFeed) => {
    setSelectedFeed(feed);
    setIsPlaying(feed.status === 'live');
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'offline': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'recording': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'port': return <MapPin className="w-4 h-4" />;
      case 'warehouse': return <Monitor className="w-4 h-4" />;
      case 'vessel': return <Activity className="w-4 h-4" />;
      case 'truck': return <Zap className="w-4 h-4" />;
      case 'gate': return <Camera className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Video className="w-6 h-6 text-red-600" />
            <span>Live Video Feeds</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of ports, warehouses, and shipments
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{viewerStats.totalViewers} watching</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Viewers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{viewerStats.totalViewers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Live Feeds</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {videoFeeds.filter(f => f.status === 'live').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Watch Time</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{viewerStats.averageViewTime}m</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Video className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recording</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {videoFeeds.filter(f => f.isRecording).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-2">
          <div ref={fullscreenRef} className="bg-black rounded-xl overflow-hidden">
            {selectedFeed ? (
              <div className="relative aspect-video">
                {selectedFeed.status === 'live' ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    loop
                    poster={selectedFeed.thumbnailUrl}
                  >
                    <source src={selectedFeed.streamUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Feed Offline</p>
                      <p className="text-sm opacity-75">{selectedFeed.description}</p>
                    </div>
                  </div>
                )}

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={togglePlayPause}
                          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={toggleMute}
                            className="p-1 hover:bg-black/50 rounded"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <select
                          value={quality}
                          onChange={(e) => setQuality(e.target.value as any)}
                          className="bg-black/50 text-white text-sm rounded px-2 py-1 border-none"
                        >
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                          <option value="4K">4K</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{selectedFeed.viewers} viewers</span>
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Indicator */}
                {selectedFeed.status === 'live' && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  </div>
                )}

                {/* Recording Indicator */}
                {selectedFeed.isRecording && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>REC</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a feed to watch</p>
                </div>
              </div>
            )}

            {/* Feed Info */}
            {selectedFeed && (
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedFeed.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFeed.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFeed.status)}`}>
                      {selectedFeed.status}
                    </span>
                    {selectedFeed.hasAudio && (
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    )}
                    {selectedFeed.nightVision && (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feed List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Available Feeds</h3>
            
            {/* Filters */}
            <div className="space-y-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="port">Ports</option>
                <option value="warehouse">Warehouses</option>
                <option value="vessel">Vessels</option>
                <option value="truck">Trucks</option>
                <option value="gate">Gates</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
                <option value="recording">Recording</option>
              </select>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {filteredFeeds.map((feed) => (
              <div
                key={feed.id}
                onClick={() => handleFeedSelect(feed)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-600 ${
                  selectedFeed?.id === feed.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={feed.thumbnailUrl}
                      alt={feed.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                    {feed.status === 'live' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {feed.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {feed.location}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(feed.type)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {feed.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {feed.viewers}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feed.status)}`}>
                      {feed.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      {feed.status === 'offline' ? (
                        <WifiOff className="w-3 h-3 text-red-500" />
                      ) : (
                        <Wifi className="w-3 h-3 text-green-500" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {feed.quality}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
