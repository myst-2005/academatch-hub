
import { useState, useEffect } from "react";
import { searchStudents, getApprovedStudents } from "@/lib/mockData";
import { Student } from "@/lib/types";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import StudentCard from "@/components/StudentCard";
import { Chip } from "@/components/ui/chip";

// Create Chip component
const ChipComponent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`bg-haca-100 text-haca-800 text-xs font-medium px-2 py-1 rounded-full mr-1 mb-1 ${className}`}>
      {children}
    </div>
  );
};

const RecruiterSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    // Initial load of all approved students
    const approved = getApprovedStudents();
    setAllStudents(approved);
    setSearchResults(approved);
  }, []);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate API delay for Gemini-powered search
    setTimeout(() => {
      const results = searchStudents(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 1200);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Candidate</h1>
            <p className="mt-2 text-gray-600 max-w-xl mx-auto">
              Use natural language to describe the candidate you're looking for. Our AI will find the best matches based on your requirements.
            </p>
          </div>
          
          <div className="mb-8 max-w-4xl mx-auto animate-fade-up">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="e.g., 'I need a C4 coding student who knows AWS and Flutter'"
            />
            
            <div className="flex flex-wrap items-center mt-4">
              <span className="text-sm text-gray-500 mr-2">Try:</span>
              <button 
                onClick={() => handleSearch("C4 coding student with React experience")}
                className="chip hover:bg-haca-200 transition-colors"
              >
                C4 coding student with React
              </button>
              <button 
                onClick={() => handleSearch("Marketing student with SEO skills")}
                className="chip hover:bg-haca-200 transition-colors"
              >
                Marketing student with SEO
              </button>
              <button 
                onClick={() => handleSearch("Design student who knows Figma")}
                className="chip hover:bg-haca-200 transition-colors"
              >
                Design student with Figma
              </button>
            </div>
          </div>
          
          <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {searchQuery && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  {isSearching ? "Searching..." : `Search Results for "${searchQuery}"`}
                </h2>
                <span className="text-sm text-gray-500">
                  {isSearching ? "..." : `${searchResults.length} candidates found`}
                </span>
              </div>
            )}
            
            {isSearching ? (
              <div className="flex justify-center py-12">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-haca-500 rounded-full animate-wave"></div>
                  <div className="w-3 h-3 bg-haca-500 rounded-full animate-wave" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-3 h-3 bg-haca-500 rounded-full animate-wave" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-elegant border border-gray-100">
                <h3 className="text-xl font-medium text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any candidates matching your search criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults(allStudents);
                  }}
                  className="text-haca-600 hover:text-haca-700 font-medium"
                >
                  View all candidates
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterSearch;
