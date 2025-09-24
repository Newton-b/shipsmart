import React from 'react';
import { TrackingDashboard } from './TrackingDashboard';

export const TrackingSection: React.FC = () => {
  return (
    <section id="tracking" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Advanced Shipment Tracking
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time visibility across multiple carriers with live updates, 
            milestone notifications, and comprehensive shipment analytics.
          </p>
        </div>
        
        <TrackingDashboard />
      </div>
    </section>
  );
};
