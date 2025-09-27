import React, { useState } from 'react';
import { Code, Copy, Play, Book, Key, Shield, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';

interface APIReferenceProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const APIReference: React.FC<APIReferenceProps> = ({ onQuoteClick, onContactClick }) => {
  const [activeEndpoint, setActiveEndpoint] = useState('tracking');

  const endpoints = [
    {
      id: 'tracking',
      method: 'GET',
      path: '/api/v1/tracking/{trackingNumber}',
      title: 'Get Tracking Information',
      description: 'Retrieve real-time tracking information for a shipment',
      parameters: [
        { name: 'trackingNumber', type: 'string', required: true, description: 'The tracking number to look up' },
        { name: 'carrierCode', type: 'string', required: false, description: 'Optional carrier code for faster lookup' }
      ],
      response: `{
  "trackingNumber": "1Z999AA1234567890",
  "carrierCode": "UPS",
  "status": "in_transit",
  "estimatedDelivery": "2024-01-20T15:30:00Z",
  "currentLocation": {
    "city": "Los Angeles",
    "state": "CA",
    "country": "US"
  },
  "events": [
    {
      "timestamp": "2024-01-18T10:15:00Z",
      "status": "departed_facility",
      "location": "Los Angeles, CA",
      "description": "Departed from Los Angeles facility"
    }
  ]
}`
    },
    {
      id: 'quote',
      method: 'POST',
      path: '/api/v1/quotes',
      title: 'Request Shipping Quote',
      description: 'Get shipping rates and transit times for your shipment',
      parameters: [
        { name: 'origin', type: 'object', required: true, description: 'Origin address information' },
        { name: 'destination', type: 'object', required: true, description: 'Destination address information' },
        { name: 'packages', type: 'array', required: true, description: 'Array of package dimensions and weights' },
        { name: 'serviceType', type: 'string', required: false, description: 'Preferred service type (ocean, air, ground)' }
      ],
      response: `{
  "quoteId": "QT-2024-001234",
  "rates": [
    {
      "serviceType": "ocean_freight",
      "transitDays": 25,
      "totalCost": 2450.00,
      "currency": "USD",
      "carrier": "RaphTrack Ocean"
    },
    {
      "serviceType": "air_freight",
      "transitDays": 3,
      "totalCost": 4200.00,
      "currency": "USD",
      "carrier": "RaphTrack Air"
    }
  ],
  "validUntil": "2024-01-25T23:59:59Z"
}`
    },
    {
      id: 'shipment',
      method: 'POST',
      path: '/api/v1/shipments',
      title: 'Create Shipment',
      description: 'Create a new shipment booking',
      parameters: [
        { name: 'quoteId', type: 'string', required: true, description: 'Quote ID from previous quote request' },
        { name: 'shipper', type: 'object', required: true, description: 'Shipper information' },
        { name: 'consignee', type: 'object', required: true, description: 'Consignee information' },
        { name: 'packages', type: 'array', required: true, description: 'Detailed package information' }
      ],
      response: `{
  "shipmentId": "SH-2024-567890",
  "trackingNumber": "1Z999AA1234567890",
  "status": "booked",
  "estimatedPickup": "2024-01-19T09:00:00Z",
  "estimatedDelivery": "2024-01-22T17:00:00Z",
  "documents": [
    {
      "type": "shipping_label",
      "url": "https://api.shipsmartlogistics.com/documents/label/SH-2024-567890.pdf"
    }
  ]
}`
    }
  ];

  const sdks = [
    {
      language: 'JavaScript',
      icon: '🟨',
      installation: 'npm install @shipsmartlogistics/api-client',
      example: `import { RaphTrackAPI } from '@shipsmartlogistics/api-client';

const client = new RaphTrackAPI({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Track a shipment
const tracking = await client.tracking.get('1Z999AA1234567890');
console.log(tracking.status);`
    },
    {
      language: 'Python',
      icon: '🐍',
      installation: 'pip install shipsmartlogistics',
      example: `from shipsmartlogistics import RaphTrackAPI

client = RaphTrackAPI(
    api_key='your-api-key',
    environment='production'
)

# Track a shipment
tracking = client.tracking.get('1Z999AA1234567890')
print(tracking.status)`
    },
    {
      language: 'PHP',
      icon: '🐘',
      installation: 'composer require shipsmartlogistics/api-client',
      example: `<?php
require_once 'vendor/autoload.php';

use RaphTrackLogistics\\ApiClient;

$client = new ApiClient([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);

// Track a shipment
$tracking = $client->tracking->get('1Z999AA1234567890');
echo $tracking->status;`
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: 'Get API Key',
      description: 'Sign up for a RaphTrack developer account and generate your API key.'
    },
    {
      step: 2,
      title: 'Install SDK',
      description: 'Choose your preferred programming language and install our SDK.'
    },
    {
      step: 3,
      title: 'Make First Call',
      description: 'Start with a simple tracking request to test your integration.'
    },
    {
      step: 4,
      title: 'Go Live',
      description: 'Switch to production environment and start shipping!'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              API Reference
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Integrate RaphTrack's logistics capabilities into your applications 
              with our comprehensive REST API and SDKs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onContactClick}
                className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Get API Key
              </button>
              <button 
                onClick={() => document.getElementById('quick-start')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-900 transition-colors"
              >
                Quick Start Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div id="quick-start" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quick Start
            </h2>
            <p className="text-xl text-gray-600">
              Get up and running with the RaphTrack API in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {quickStart.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              API Endpoints
            </h2>
            <p className="text-xl text-gray-600">
              Explore our REST API endpoints and their usage
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Endpoint List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setActiveEndpoint(endpoint.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeEndpoint === endpoint.id
                          ? 'bg-purple-100 text-purple-900 border-l-4 border-purple-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{endpoint.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {endpoint.method}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Endpoint Details */}
            <div className="lg:col-span-2">
              {endpoints.filter(e => e.id === activeEndpoint).map((endpoint) => (
                <div key={endpoint.id} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`px-3 py-1 rounded font-medium text-sm ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {endpoint.path}
                    </code>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{endpoint.title}</h3>
                  <p className="text-gray-600 mb-8">{endpoint.description}</p>

                  {/* Parameters */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Required</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {endpoint.parameters.map((param, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-mono text-gray-900">{param.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{param.type}</td>
                              <td className="px-4 py-3 text-sm">
                                {param.required ? (
                                  <span className="text-red-600 font-medium">Yes</span>
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Response Example</h4>
                      <button
                        onClick={() => copyToClipboard(endpoint.response)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{endpoint.response}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SDKs */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Official SDKs
            </h2>
            <p className="text-xl text-gray-600">
              Use our official SDKs to integrate faster
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sdks.map((sdk, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{sdk.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{sdk.language}</h3>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Installation</h4>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <code className="text-sm font-mono">{sdk.installation}</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Example Usage</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{sdk.example}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Authentication & Security
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our API uses API key authentication with industry-standard security practices 
                to keep your data safe and secure.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">API Key authentication</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">HTTPS encryption for all requests</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Rate limiting and monitoring</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Sandbox environment for testing</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Authentication Header</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-6">
                <code className="text-sm">
                  Authorization: Bearer your-api-key-here
                </code>
              </div>
              <div className="flex items-center gap-4">
                <Key className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Need an API Key?</h4>
                  <p className="text-gray-600 text-sm">Contact our team to get started</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Get your API key today and start integrating world-class logistics into your applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onContactClick}
              className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center justify-center"
            >
              Get API Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onQuoteClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-900 transition-colors"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
