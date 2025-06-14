
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Last updated: June 7, 2025</p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  At AutoCart, we collect information to provide you with the best AI-powered shopping experience:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Personal information (name, email, phone number)</li>
                  <li>Shopping preferences and behavior</li>
                  <li>AI chat interactions and product searches</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Device and usage information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide personalized AI shopping recommendations</li>
                  <li>Process orders and manage your account</li>
                  <li>Improve our AI algorithms and services</li>
                  <li>Send important updates about your orders</li>
                  <li>Provide customer support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. AI and Machine Learning</h2>
                <p className="text-gray-700 mb-4">
                  Our AI agent learns from your interactions to provide better recommendations. We use machine learning to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Understand your shopping preferences</li>
                  <li>Curate personalized product selections</li>
                  <li>Improve chat responses and assistance</li>
                  <li>Optimize inventory and pricing suggestions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Merchant partners to fulfill orders</li>
                  <li>Payment processors for secure transactions</li>
                  <li>Service providers who help operate our platform</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700">
                  We implement industry-standard security measures to protect your data, including encryption, 
                  secure servers, and regular security audits. Your payment information is processed through 
                  PCI-compliant payment processors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access your personal information</li>
                  <li>Update or correct your data</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-700">
                  If you have questions about this Privacy Policy, contact us at:
                  <br />
                  Email: privacy@autocart.com
                  <br />
                  Address: 123 AI Commerce Street, Tech City, TC 12345
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
