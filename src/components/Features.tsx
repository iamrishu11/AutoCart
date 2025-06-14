import { Bot, Search, ShoppingCart, CreditCard, Truck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Chat",
      description: "Natural conversations with our intelligent shopping assistant that understands your needs",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Search,
      title: "Product Curation",
      description: "Smart product recommendations tailored to your preferences and shopping history",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ShoppingCart,
      title: "Stock Management",
      description: "Real-time inventory checking across multiple suppliers for best availability",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: CreditCard,
      title: "Payman SDK Integration",
      description: "Secure, seamless payments with multiple payment options and fraud protection",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Truck,
      title: "Delivery Tracking",
      description: "Real-time package tracking with AI-powered delivery predictions",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Sparkles,
      title: "1-Click Autonomous",
      description: "Complete shopping experience from discovery to delivery in just one click",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Smart Shopping</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI commerce agent combines cutting-edge technology with intuitive design 
            to revolutionize your online shopping experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
