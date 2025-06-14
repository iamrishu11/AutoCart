import { Button } from "@/components/ui/button";
import { Bot, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleStartShopping = () => {
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 bg-opacity-95 backdrop-blur-md shadow-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AutoCart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
              How It Works
            </button>
            <Link to="/pricing" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
              Pricing
            </Link>
            <Link to="/help-center" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
              Help
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50" onClick={handleLogin}>
              Login
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handleStartShopping}>
              Start Shopping
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-gray-200">
            <div className="flex flex-col space-y-4 mt-6">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 font-medium text-left">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-purple-600 font-medium text-left">
                How It Works
              </button>
              <Link to="/pricing" className="text-gray-700 hover:text-purple-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <Link to="/help-center" className="text-gray-700 hover:text-purple-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Help
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <Button variant="outline" className="border-purple-600 text-purple-600" onClick={handleLogin}>
                  Login
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600" onClick={handleStartShopping}>
                  Start Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
