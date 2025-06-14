
import { Button } from "@/components/ui/button";
import { ShoppingBag, Bot, Zap, CreditCard, Truck, MessageCircle, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/dashboard');
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-bounce delay-500"></div>
        
        {/* Floating shopping icons */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <ShoppingBag className="w-8 h-8 text-yellow-300 opacity-70" />
        </div>
        <div className="absolute top-3/4 right-1/4 animate-float delay-1000">
          <CreditCard className="w-8 h-8 text-green-300 opacity-70" />
        </div>
        <div className="absolute top-1/3 right-1/2 animate-float delay-500">
          <Truck className="w-8 h-8 text-blue-300 opacity-70" />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left content */}
          <div className="lg:w-1/2 text-white mb-12 lg:mb-0">
            <div className="flex items-center mb-6 animate-fade-in">
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 backdrop-blur-sm">
                <Bot className="w-8 h-8 text-yellow-300 mr-3" />
                <span className="text-xl font-bold text-yellow-300">AutoCart AI</span>
                <div className="ml-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in delay-200">
              The Future of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 animate-pulse">
                Smart Shopping
              </span>
              <span className="text-4xl lg:text-5xl block mt-2">is Here!</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 animate-fade-in delay-300">
              Meet your personal AI shopping assistant that chats, curates, and completes purchases in seconds. 
              Experience autonomous shopping like never before! 🛒✨
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in delay-400">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                onClick={handleStartShopping}
              >
                <ShoppingBag className="w-6 h-6 mr-2" />
                Start Shopping Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                className="bg-white bg-opacity-20 border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg rounded-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>
            
            {/* Enhanced feature highlights */}
            <div className="grid grid-cols-2 gap-6 animate-fade-in delay-500">
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-yellow-300 mr-3" />
                <span className="text-lg font-semibold">1-Click Shopping</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-yellow-300 mr-3" />
                <span className="text-lg font-semibold">AI Chat Assistant</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <CreditCard className="w-6 h-6 text-yellow-300 mr-3" />
                <span className="text-lg font-semibold">Secure Payments</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <Truck className="w-6 h-6 text-yellow-300 mr-3" />
                <span className="text-lg font-semibold">Real-time Tracking</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center space-x-6 text-sm text-blue-200 animate-fade-in delay-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                50K+ Happy Customers
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                99.9% Uptime
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                24/7 AI Support
              </div>
            </div>
          </div>
          
          {/* Right content - Enhanced Agent preview */}
          <div className="lg:w-1/2 lg:pl-12 animate-fade-in delay-700">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500 hover:shadow-3xl">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-pulse">
                      <Bot className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-white font-bold text-lg">AutoCart AI Assistant</h3>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <p className="text-purple-100">Online & Ready to Help</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 animate-fade-in">
                      <p className="text-white text-sm">👋 Hi! I'm your AI shopping assistant. What are you looking for today?</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 animate-fade-in delay-200">
                      <p className="text-white text-sm">🛍️ I found 15 wireless headphones with 5⭐ reviews under $200!</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 animate-fade-in delay-400">
                      <p className="text-white text-sm">💳 Ready to purchase? I can complete this in 1-click!</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">Premium Headphones</p>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">$199.99</span>
                          <div className="ml-2 flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
                      Buy Now
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl border border-pink-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg"></div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">Smart Watch</p>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">$149.99</span>
                          <div className="ml-2 flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Floating elements around the preview */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-black rounded-full p-2 animate-bounce">
                <Zap className="w-4 h-4" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-400 text-white rounded-full p-2 animate-pulse">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
