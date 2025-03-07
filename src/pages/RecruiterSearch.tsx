import { useState, useEffect } from "react";
import { Student } from "@/lib/types";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import StudentCard from "@/components/StudentCard";
import { Chip } from "@/components/ui/chip";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RecruiterSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load approved students from Supabase
    fetchApprovedStudents();
  }, []);
  
  const fetchApprovedStudents = async () => {
    setIsSearching(true);
    
    try {
      console.log("Fetching approved students from Supabase...");
      
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (studentsError) {
        console.error("Error fetching students:", studentsError);
        toast({
          title: "Error loading students",
          description: studentsError.message,
          variant: "destructive"
        });
        throw studentsError;
      }
      
      if (!studentsData || studentsData.length === 0) {
        console.log("No approved students found");
        setAllStudents([]);
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      // For each student, fetch their skills
      const studentsWithSkills = await Promise.all(
        studentsData.map(async (student: any) => {
          // Get skills for this student
          const { data: skillsData, error: skillsError } = await supabase
            .from('student_skills')
            .select(`
              skill_id,
              skills:skills(id, name)
            `)
            .eq('student_id', student.id);
          
          if (skillsError) {
            console.error("Error fetching skills for student:", student.id, skillsError);
            return {
              ...student,
              skills: []
            };
          }
          
          // Format the student with their skills
          return {
            id: student.id,
            name: student.name,
            batch: student.batch,
            school: student.school,
            yearsOfExperience: student.years_of_experience,
            linkedinUrl: student.linkedin_url,
            resumeUrl: student.resume_url,
            status: student.status,
            createdAt: new Date(student.created_at),
            skills: skillsData ? skillsData.map((item: any) => item.skills) : []
          };
        })
      );
      
      console.log("Fetched approved students with skills:", studentsWithSkills);
      setAllStudents(studentsWithSkills);
      setSearchResults(studentsWithSkills);
    } catch (error) {
      console.error("Error in fetchApprovedStudents:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    try {
      if (!query.trim()) {
        // If empty query, show all approved students
        setSearchResults(allStudents);
        setAnalysisResult(null);
        return;
      }
      
      console.log("Searching for students matching:", query);
      
      // Prepare query terms for flexible searching
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
      
      // Filter students based on search terms
      const filteredStudents = allStudents.filter(student => {
        // Search in name
        if (student.name.toLowerCase().includes(query.toLowerCase())) return true;
        
        // Search in school
        if (student.school.toLowerCase().includes(query.toLowerCase())) return true;
        
        // Search in batch
        if (student.batch.toLowerCase().includes(query.toLowerCase())) return true;
        
        // Search in skills
        if (student.skills.some(skill => 
          skill.name.toLowerCase().includes(query.toLowerCase())
        )) return true;
        
        // Check if multiple terms match different attributes
        const matchesTerms = searchTerms.some(term => {
          return student.name.toLowerCase().includes(term) || 
                 student.school.toLowerCase().includes(term) || 
                 student.batch.toLowerCase().includes(term) || 
                 student.skills.some(skill => skill.name.toLowerCase().includes(term));
        });
        
        return matchesTerms;
      });
      
      console.log("Search results:", filteredStudents.length, "students found");
      setSearchResults(filteredStudents);
      
      // Then, analyze the skills using Gemini API
      if (query.trim()) {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        
        const { data, error } = await supabase.functions.invoke('analyze-skills', {
          body: { text: query }
        });
        
        if (error) {
          console.error("Error analyzing skills:", error);
          toast({
            title: "Error analyzing skills",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          console.log("Analysis data:", data);
          setAnalysisResult(data.analysis);
        }
      } else {
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error("Error in search:", error);
      toast({
        title: "Search error",
        description: "An error occurred during the search process",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      setIsAnalyzing(false);
    }
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
          
          <div className="mb-10 max-w-4xl mx-auto animate-fade-up">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="e.g., 'I need a C4 coding student who knows AWS and Flutter'"
            />
            
            <div className="flex flex-wrap items-center mt-6 gap-3">
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-800">
                  {isSearching ? "Searching..." : `Search Results for "${searchQuery}"`}
                </h2>
                <span className="text-sm text-gray-500">
                  {isSearching ? "..." : `${searchResults.length} candidates found`}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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
                        setAnalysisResult(null);
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
              
              {/* Gemini Skill Analysis Panel */}
              <div className="lg:col-span-1">
                {searchQuery && (
                  <div className="bg-white rounded-xl shadow-elegant border border-gray-100 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Skills Analysis
                    </h3>
                    
                    {isAnalyzing ? (
                      <div className="flex justify-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="flex space-x-2 mb-3">
                            <div className="w-2 h-2 bg-haca-500 rounded-full animate-wave"></div>
                            <div className="w-2 h-2 bg-haca-500 rounded-full animate-wave" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-haca-500 rounded-full animate-wave" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                          <p className="text-sm text-gray-500">Analyzing skills with AI...</p>
                        </div>
                      </div>
                    ) : analysisResult ? (
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br/>') }} />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No analysis available. Try searching for specific skills or requirements.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterSearch;
