import React from 'react';
import { Cookie, Settings, BarChart3, Shield, Eye, Trash2 } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <Cookie className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Learn how we use cookies and similar technologies to improve your experience.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated: January 1, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
          
          {/* What are Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Cookie className="h-6 w-6 text-blue-600 mr-3" />
              What are Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences, keeping you logged in, and 
              understanding how you use our platform.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> Cookies cannot harm your device or files. They are simply small data files 
                that help websites function properly and provide personalized experiences.
              </p>
            </div>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Types of Cookies We Use
            </h2>
            <div className="grid gap-6">
              
              {/* Essential Cookies */}
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center mb-3">
                  <Shield className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Essential Cookies</h3>
                  <span className="ml-auto bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs">Required</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Authentication and login</li>
                    <li>• Security and fraud prevention</li>
                    <li>• Load balancing</li>
                  </ul>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Shopping cart functionality</li>
                    <li>• Form submission</li>
                    <li>• CSRF protection</li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-3">
                  <Settings className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Functional Cookies</h3>
                  <span className="ml-auto bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">Optional</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  These cookies enable enhanced functionality and personalization. They may be set by us or by 
                  third-party providers whose services we use.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Language preferences</li>
                    <li>• Theme settings (dark/light mode)</li>
                    <li>• Dashboard customization</li>
                  </ul>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Notification preferences</li>
                    <li>• Recently viewed items</li>
                    <li>• Saved search filters</li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center mb-3">
                  <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Cookies</h3>
                  <span className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">Optional</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Page views and traffic sources</li>
                    <li>• User behavior patterns</li>
                    <li>• Performance monitoring</li>
                  </ul>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Feature usage statistics</li>
                    <li>• Error tracking</li>
                    <li>• A/B testing</li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center mb-3">
                  <Eye className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketing Cookies</h3>
                  <span className="ml-auto bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">Optional</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  These cookies are used to deliver advertisements more relevant to you and your interests. 
                  They also help limit the number of times you see an advertisement.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Targeted advertising</li>
                    <li>• Social media integration</li>
                    <li>• Retargeting campaigns</li>
                  </ul>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Conversion tracking</li>
                    <li>• Cross-device recognition</li>
                    <li>• Interest-based ads</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use various third-party services that may set their own cookies. These services help us provide 
              better functionality and understand our users better.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics Services</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Google Analytics</li>
                  <li>• Hotjar (heatmaps)</li>
                  <li>• Mixpanel (user tracking)</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Support Services</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Intercom (live chat)</li>
                  <li>• Zendesk (support)</li>
                  <li>• Stripe (payments)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="h-6 w-6 text-blue-600 mr-3" />
              Managing Your Cookie Preferences
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cookie Consent Manager</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You can manage your cookie preferences at any time using our cookie consent manager. 
                  Click the button below to open your preferences.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Manage Cookie Preferences
                </button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Browser Settings</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You can also control cookies through your browser settings. Here's how to manage cookies 
                  in popular browsers:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Chrome:</strong> Settings → Privacy → Cookies</li>
                    <li>• <strong>Firefox:</strong> Options → Privacy → Cookies</li>
                  </ul>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                    <li>• <strong>Edge:</strong> Settings → Privacy → Cookies</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Trash2 className="h-6 w-6 text-blue-600 mr-3" />
              Cookie Retention
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Different types of cookies are stored for different periods:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Session Cookies</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deleted when you close your browser</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Persistent Cookies</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stored for up to 2 years</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Analytics Cookies</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stored for up to 26 months</p>
                </div>
              </div>
            </div>
          </section>

          {/* Impact of Disabling Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Impact of Disabling Cookies
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you choose to disable cookies, some features of our platform may not work properly:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• You may need to log in repeatedly</li>
                  <li>• Your preferences won't be saved</li>
                  <li>• Some features may be unavailable</li>
                </ul>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Shopping cart may not work</li>
                  <li>• Personalization will be limited</li>
                  <li>• Analytics tracking will be disabled</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Questions About Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-600 dark:text-gray-400">privacy@raphtrack.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Phone</p>
                  <p className="text-gray-600 dark:text-gray-400">+233559204847</p>
                </div>
              </div>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              other operational, legal, or regulatory reasons. We will notify you of any material changes 
              by posting the updated policy on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
