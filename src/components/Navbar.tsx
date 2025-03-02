
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "@/lib/mockData";
import { User } from "@/lib/types";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    toast({
      title: "Logged out successfully",
      duration: 3000,
    });
    
    // Close mobile menu after logout
    setIsMenuOpen(false);
  };
  
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Close menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="glass-morph sticky top-0 z-50 py-3 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-haca-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">H</span>
            </div>
            <span className="text-xl font-medium text-gray-800">HACA</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-haca-600 ${
              location.pathname === "/" ? "text-haca-600" : "text-gray-600"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/recruiter" 
            className={`text-sm font-medium transition-colors hover:text-haca-600 ${
              location.pathname === "/recruiter" ? "text-haca-600" : "text-gray-600"
            }`}
          >
            Recruiter Search
          </Link>
          <Link 
            to="/registration" 
            className={`text-sm font-medium transition-colors hover:text-haca-600 ${
              location.pathname === "/registration" ? "text-haca-600" : "text-gray-600"
            }`}
          >
            Student Registration
          </Link>
          {currentUser?.isAdmin && (
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-haca-600 ${
                location.pathname === "/admin" ? "text-haca-600" : "text-gray-600"
              }`}
            >
              Admin Dashboard
            </Link>
          )}
          
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 bg-haca-100">
                <AvatarFallback className="text-haca-600">
                  {getInitials(currentUser.username)}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-haca-200 text-haca-700 hover:bg-haca-50">
                Login
              </Button>
            </Link>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50 glass-morph py-4 px-6 border-t border-gray-200 shadow-elegant animate-fade-down">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-haca-600 ${
                location.pathname === "/" ? "text-haca-600" : "text-gray-600"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/recruiter" 
              className={`text-sm font-medium transition-colors hover:text-haca-600 ${
                location.pathname === "/recruiter" ? "text-haca-600" : "text-gray-600"
              }`}
            >
              Recruiter Search
            </Link>
            <Link 
              to="/registration" 
              className={`text-sm font-medium transition-colors hover:text-haca-600 ${
                location.pathname === "/registration" ? "text-haca-600" : "text-gray-600"
              }`}
            >
              Student Registration
            </Link>
            {currentUser?.isAdmin && (
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-colors hover:text-haca-600 ${
                  location.pathname === "/admin" ? "text-haca-600" : "text-gray-600"
                }`}
              >
                Admin Dashboard
              </Link>
            )}
            
            {currentUser ? (
              <div className="pt-2 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="pt-2 border-t border-gray-200">
                <Button variant="outline" size="sm" className="w-full border-haca-200 text-haca-700 hover:bg-haca-50">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
