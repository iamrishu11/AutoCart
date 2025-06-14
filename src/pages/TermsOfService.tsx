
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: June 7, 2025</p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using AutoCart's AI-powered shopping platform, you accept and agree to be bound by 
                  these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 mb-4">
                  AutoCart provides an AI-powered autonomous shopping agent that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Chats with users to understand shopping needs</li>
                  <li>Curates personalized product recommendations</li>
                  <li>Checks real-time stock availability</li>
                  <li>Handles secure payments through integrated payment systems</li>
                  <li>Tracks delivery and order status</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-700 mb-4">
                  To use AutoCart, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Providing accurate and complete information</li>
                  <li>Maintaining the security of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. AI Agent Usage</h2>
                <p className="text-gray-700 mb-4">
                  Our AI shopping agent is designed to assist you, but:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>AI recommendations are based on algorithms and may not always be perfect</li>
                  <li>Final purchase decisions are your responsibility</li>
                  <li>Product availability and pricing are subject to merchant terms</li>
                  <li>You should review all purchases before confirming</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payments and Transactions</h2>
                <p className="text-gray-700 mb-4">
                  All transactions are processed securely through our payment partners. By making a purchase:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>You authorize the payment amount</li>
                  <li>You agree to pay all applicable taxes and fees</li>
                  <li>Refunds are subject to merchant policies</li>
                  <li>Disputed transactions should be reported immediately</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
                <p className="text-gray-700 mb-4">You may not:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Use the service for illegal activities</li>
                  <li>Attempt to hack or disrupt our systems</li>
                  <li>Share your account with others</li>
                  <li>Use automated tools to access our service</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-700">
                  AutoCart provides the service "as is" and cannot guarantee uninterrupted access or perfect AI 
                  recommendations. We are not liable for indirect damages, merchant issues, or third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
                <p className="text-gray-700">
                  We may terminate your account for violation of these terms. You may close your account at any time. 
                  Upon termination, your right to use the service ends immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
                <p className="text-gray-700">
                  For questions about these Terms of Service, contact us at:
                  <br />
                  Email: legal@autocart.com
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

export default TermsOfService;
