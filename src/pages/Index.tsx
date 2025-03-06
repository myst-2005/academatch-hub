
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { initializeLocalStorage } from "@/lib/mockData";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const Index = () => {
  // Initialize local storage with mock data
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center animate-fade-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                HACA Placement Platform
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                An exclusive recruitment platform connecting talented academy students with top companies looking for skilled professionals.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/recruiter">
                  <Button className="w-full sm:w-auto bg-haca-600 hover:bg-haca-700 text-white font-medium px-8 py-6 h-auto text-base rounded-xl shadow-sm transition-all hover:shadow-md">
                    I'm a Recruiter
                  </Button>
                </Link>
                <Link to="/registration">
                  <Button variant="outline" className="w-full sm:w-auto border-haca-200 text-haca-700 hover:bg-haca-50 font-medium px-8 py-6 h-auto text-base rounded-xl transition-all">
                    I'm a Student
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="w-full sm:w-auto text-gray-600 hover:text-haca-700 hover:bg-haca-50 font-medium px-8 py-6 h-auto text-base rounded-xl transition-all">
                    Student Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="glass-panel p-6">
                <div className="w-12 h-12 rounded-full bg-haca-100 flex items-center justify-center mb-4">
                  <span className="text-haca-600 text-xl font-semibold">1</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">For Students</h3>
                <p className="text-gray-600">
                  Register your profile, showcase your skills, and connect with top companies looking for talent just like you.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <div className="w-12 h-12 rounded-full bg-haca-100 flex items-center justify-center mb-4">
                  <span className="text-haca-600 text-xl font-semibold">2</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">For Recruiters</h3>
                <p className="text-gray-600">
                  Search for candidates using natural language, filter by skills, and find the perfect match for your team.
                </p>
              </div>
              
              <div className="glass-panel p-6">
                <div className="w-12 h-12 rounded-full bg-haca-100 flex items-center justify-center mb-4">
                  <span className="text-haca-600 text-xl font-semibold">3</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">For Admins</h3>
                <p className="text-gray-600">
                  Review and approve student profiles to ensure only verified candidates are displayed to recruiters.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-50 py-8 px-4 sm:px-6 md:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} HACA Placement Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
