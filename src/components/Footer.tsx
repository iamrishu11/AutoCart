
import { Bot, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AutoCart</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Revolutionizing online shopping with AI-powered autonomous agents. 
              Experience the future of e-commerce today.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors duration-300" />
              <Twitter className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors duration-300" />
              <Instagram className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors duration-300" />
              <Linkedin className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors duration-300" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">How It Works</a></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Pricing</Link></li>
              <li><Link to="/help-center" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Help Center</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/help-center" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Help Center</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 AutoCart. All rights reserved. Made with ❤️ for the future of shopping.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
