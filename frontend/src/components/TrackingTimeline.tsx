import React from 'react';
import { Clock, MapPin, Package, Truck, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface TrackingEvent {
  status: string;
  description?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: string;
  estimatedDelivery?: string;
  signedBy?: string;
  externalEventId?: string;
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'IN_TRANSIT':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'EXCEPTION':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'PICKED_UP':
      case 'COLLECTED':
        return <Package className="w-5 h-5 text-purple-600" />;
      case 'DEPARTED':
      case 'ARRIVED':
        return <MapPin className="w-5 h-5 text-indigo-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'border-green-500 bg-green-50';
      case 'OUT_FOR_DELIVERY':
        return 'border-blue-500 bg-blue-50';
      case 'IN_TRANSIT':
        return 'border-yellow-500 bg-yellow-50';
      case 'EXCEPTION':
        return 'border-red-500 bg-red-50';
      case 'PICKED_UP':
      case 'COLLECTED':
        return 'border-purple-500 bg-purple-50';
      case 'DEPARTED':
      case 'ARRIVED':
        return 'border-indigo-500 bg-indigo-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const formatLocation = (location?: TrackingEvent['location']) => {
    if (!location) return null;

    const parts = [
      location.address,
      location.city,
      location.state,
      location.country
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : null;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return {
        date: date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return { date: 'Invalid date', time: '' };
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Info className="w-5 h-5 mr-2" />
        No tracking events available
      </div>
    );
  }

  // Sort events by timestamp (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const { date, time } = formatTimestamp(event.timestamp);
        const location = formatLocation(event.location);
        const isLatest = index === 0;

        return (
          <div
            key={`${event.timestamp}-${index}`}
            className={`relative flex items-start space-x-4 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
              getStatusColor(event.status)
            } ${isLatest ? 'ring-2 ring-blue-200' : ''}`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(event.status)}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Status and Description */}
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {event.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    {isLatest && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-700 mb-2">
                      {event.description}
                    </p>
                  )}

                  {/* Location */}
                  {location && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {event.signedBy && (
                      <span>Signed by: {event.signedBy}</span>
                    )}
                    {event.estimatedDelivery && (
                      <span>
                        Est. delivery: {new Date(event.estimatedDelivery).toLocaleDateString()}
                      </span>
                    )}
                    {event.externalEventId && (
                      <span>Event ID: {event.externalEventId}</span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right ml-4">
                  <div className="text-sm font-medium text-gray-900">{date}</div>
                  <div className="text-xs text-gray-500">{time}</div>
                </div>
              </div>
            </div>

            {/* Timeline connector */}
            {index < sortedEvents.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
            )}
          </div>
        );
      })}

      {/* Timeline end indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Tracking history complete</span>
        </div>
      </div>
    </div>
  );
};
