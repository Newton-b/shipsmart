import React from 'react';
import { FileText, Scale, AlertTriangle, Users, CreditCard, Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <Scale className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Please read these terms carefully before using our logistics platform.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using RaphTrack's logistics tracking platform and related services, you accept and agree 
              to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Service Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              RaphTrack provides logistics tracking and freight forwarding services including:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Core Services</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Real-time shipment tracking</li>
                  <li>• Ocean and air freight</li>
                  <li>• Ground transportation</li>
                  <li>• Customs clearance</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Features</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Dashboard analytics</li>
                  <li>• Document management</li>
                  <li>• API integration</li>
                  <li>• Customer support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              User Responsibilities
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Security</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use strong passwords and enable two-factor authentication</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Accurate Information</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Provide accurate and complete shipment information</li>
                  <li>Ensure compliance with all applicable laws and regulations</li>
                  <li>Declare hazardous materials and restricted items</li>
                  <li>Update your contact and billing information promptly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              Prohibited Uses
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-gray-700 dark:text-gray-300 mb-4">You may not use our services for:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Illegal or fraudulent activities</li>
                  <li>• Shipping prohibited or restricted items</li>
                  <li>• Violating intellectual property rights</li>
                  <li>• Disrupting or interfering with our services</li>
                </ul>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Attempting to gain unauthorized access</li>
                  <li>• Transmitting malware or harmful code</li>
                  <li>• Spamming or unsolicited communications</li>
                  <li>• Reverse engineering our platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              Payment Terms
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Billing and Payments</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Payments are due within 30 days of invoice date</li>
                  <li>• Late payments may incur additional fees</li>
                  <li>• We accept major credit cards and bank transfers</li>
                  <li>• All prices are subject to applicable taxes</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Refunds and Disputes</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Refund requests must be submitted within 30 days</li>
                  <li>• Disputes will be resolved according to our dispute resolution process</li>
                  <li>• Service credits may be issued for service interruptions</li>
                  <li>• Processing fees are non-refundable</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Limitation of Liability
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                RaphTrack's liability is limited to the maximum extent permitted by law. We are not liable for:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Indirect, incidental, or consequential damages</li>
                  <li>• Loss of profits, data, or business opportunities</li>
                  <li>• Delays caused by third-party carriers</li>
                </ul>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Force majeure events beyond our control</li>
                  <li>• Customs delays or regulatory issues</li>
                  <li>• Damage to goods in transit (covered by insurance)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All content, features, and functionality of the RaphTrack platform are owned by us and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">License Grant</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We grant you a limited, non-exclusive, non-transferable license to access and use our platform 
                for your business purposes, subject to these terms.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Termination
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Either party may terminate this agreement with 30 days written notice. We may terminate immediately 
                for breach of these terms or illegal activity.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Effect of Termination</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Access to the platform will be suspended</li>
                  <li>• Outstanding invoices remain due</li>
                  <li>• Data export available for 90 days</li>
                  <li>• Confidentiality obligations survive termination</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Governing Law and Disputes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These terms are governed by the laws of Ghana. Any disputes will be resolved through binding arbitration 
              or in the courts of Ghana.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dispute Resolution</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We encourage resolving disputes through direct communication. If unsuccessful, disputes will be 
                resolved through mediation, and if necessary, binding arbitration.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-600 dark:text-gray-400">legal@raphtrack.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Phone</p>
                  <p className="text-gray-600 dark:text-gray-400">+233559204847</p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these terms at any time. Material changes will be communicated via 
              email or platform notification. Continued use of our services constitutes acceptance of the modified terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
