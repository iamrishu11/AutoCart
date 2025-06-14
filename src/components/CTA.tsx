
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Sparkles className="w-16 h-16 text-yellow-300 animate-spin" />
        </div>
        
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
          Ready to Experience the Future?
        </h2>
        
        <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
          Join thousands of happy customers who've revolutionized their shopping experience 
          with our AI commerce agent
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-12 py-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            Get Started Now
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          
          <div className="text-white">
            <p className="text-lg font-semibold">✨ No credit card required</p>
            <p className="text-blue-200">Start your free trial today</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
