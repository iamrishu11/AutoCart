import { MessageCircle, Search, ShoppingCart, CreditCard } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageCircle,
      title: "Chat with AI",
      description: "Tell our AI what you're looking for in natural language",
      color: "bg-blue-500"
    },
    {
      icon: Search,
      title: "AI Curates",
      description: "Our agent finds and curates the best products for you",
      color: "bg-purple-500"
    },
    {
      icon: ShoppingCart,
      title: "Review & Select",
      description: "Browse AI-recommended products with real-time stock info",
      color: "bg-green-500"
    },
    {
      icon: CreditCard,
      title: "1-Click Purchase",
      description: "Complete your purchase instantly with secure payment",
      color: "bg-orange-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Shopping made simple with our AI-powered autonomous agent
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-white bg-opacity-30 transform -translate-x-10"></div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-purple-100 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
