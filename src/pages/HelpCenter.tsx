
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, Search, ShoppingCart, CreditCard, Truck, Bot, HelpCircle } from "lucide-react";

const HelpCenter = () => {
  const faqs = [
    {
      question: "How does the AI shopping agent work?",
      answer: "Our AI agent uses natural language processing to understand your shopping needs, then searches through millions of products to find the best matches for you. It can check stock, compare prices, and even complete purchases with your approval."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes! We use industry-standard encryption and work with PCI-compliant payment processors. Your payment information is never stored on our servers and is processed securely through our trusted partners."
    },
    {
      question: "Can I track my orders?",
      answer: "Absolutely! Our AI agent provides real-time tracking updates and will notify you about shipping status, delivery estimates, and any changes to your order."
    },
    {
      question: "What if I want to return something?",
      answer: "Returns are handled according to each merchant's return policy. Our AI agent can help you initiate returns and will guide you through the process for each specific purchase."
    },
    {
      question: "How accurate are the AI recommendations?",
      answer: "Our AI learns from your preferences and shopping history to provide increasingly accurate recommendations. While we strive for precision, we always recommend reviewing products before purchasing."
    },
    {
      question: "Can I set a budget limit?",
      answer: "Yes! You can set spending limits and budget alerts in your account settings. The AI agent will respect these limits and alert you before any purchases exceed your specified amounts."
    }
  ];

  const supportTopics = [
    {
      icon: Bot,
      title: "AI Agent Setup",
      description: "Learn how to configure and personalize your AI shopping assistant"
    },
    {
      icon: Search,
      title: "Product Search",
      description: "Tips for getting the best search results and recommendations"
    },
    {
      icon: ShoppingCart,
      title: "Making Purchases",
      description: "How to review, modify, and complete purchases through the AI agent"
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Managing payment methods, billing, and transaction history"
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      description: "Tracking orders, delivery options, and shipping information"
    },
    {
      icon: MessageCircle,
      title: "Chat Features",
      description: "Making the most of AI conversations and getting better assistance"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Help Center</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Get help with your AutoCart AI shopping experience. Find answers, guides, and support.
            </p>
          </div>
        </div>

        {/* Support Topics */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Browse Help Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportTopics.map((topic, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <topic.icon className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{topic.title}</h3>
                  <p className="text-gray-600">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Still Need Help?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help you with any questions about AutoCart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-blue-100">Available 24/7</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
                  📧
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-blue-100">support@autocart.com</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
                  📞
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-blue-100">1-800-AUTOCART</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;
