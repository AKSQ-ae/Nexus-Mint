import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Building2, Coins } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center h-20">
          
          {/* Left Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 flex-1">
            <Link 
              to="/how-it-works" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              How it works
            </Link>
            <Link 
              to="/properties" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Properties
            </Link>
            <Link 
              to="/global-trading" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Trading
            </Link>
          </div>

          {/* Center Logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-black tracking-wide">
                <span className="text-blue-600">NEXUS</span>
                <span className="text-orange-500 ml-1">MINT</span>
              </div>
            </Link>
          </div>

          {/* Right Side Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4 justify-end flex-1">
            <Link 
              to="/early-access" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105"
            >
              Early Access
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/auth/signin">
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 space-y-2 border-t border-gray-200">
            <div className="space-y-1">
              <Link 
                to="/how-it-works" 
                className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                How it works
              </Link>
              <Link 
                to="/properties" 
                className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Properties
              </Link>
              <Link 
                to="/global-trading" 
                className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Trading
              </Link>
            </div>
            
            <div className="px-4 pt-4 border-t border-gray-200 space-y-3">
              <Link to="/auth/signin" onClick={() => setIsOpen(false)} className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-center border-gray-300 text-gray-700"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth/signup" onClick={() => setIsOpen(false)} className="block">
                <Button 
                  className="w-full justify-center bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}