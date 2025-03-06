
import { useState, useEffect } from "react";
import { ApprovalStatus, Student, Skill } from "@/lib/types";
import Navbar from "@/components/Navbar";
import StudentCard from "@/components/StudentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [rejectedStudents, setRejectedStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  
  // Load students data
  useEffect(() => {
    console.log("Loading students data...");
    loadStudents();
  }, []);
  
  const loadStudents = async () => {
    setIsLoading(true);
    
    try {
      console.log("Fetching students from Supabase...");
      
      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (studentsError) {
        console.error("Error fetching students:", studentsError);
        throw studentsError;
      }
      
      console.log("Fetched students data:", studentsData);
      
      if (!studentsData || studentsData.length === 0) {
        console.log("No students found in the database");
        setIsLoading(false);
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
      
      console.log("Students with skills:", studentsWithSkills);
      
      // Filter students based on status
      const pending = studentsWithSkills.filter(s => s.status === ApprovalStatus.Pending);
      const approved = studentsWithSkills.filter(s => s.status === ApprovalStatus.Approved);
      const rejected = studentsWithSkills.filter(s => s.status === ApprovalStatus.Rejected);
      
      console.log("Pending students:", pending.length);
      console.log("Approved students:", approved.length);
      console.log("Rejected students:", rejected.length);
      
      setPendingStudents(pending);
      setApprovedStudents(approved);
      setRejectedStudents(rejected);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error loading students",
        description: error.message || "Failed to load students data",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async (id: string) => {
    console.log("Approving student with ID:", id);
    try {
      const { error } = await supabase
        .from('students')
        .update({ status: ApprovalStatus.Approved })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Student approved",
        description: "The student profile has been approved successfully",
        duration: 3000,
      });
      
      loadStudents();
    } catch (error) {
      console.error("Error approving student:", error);
      toast({
        title: "Error approving student",
        description: error.message || "Failed to approve student profile",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const handleReject = async (id: string) => {
    console.log("Rejecting student with ID:", id);
    try {
      const { error } = await supabase
        .from('students')
        .update({ status: ApprovalStatus.Rejected })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Student rejected",
        description: "The student profile has been rejected",
        duration: 3000,
      });
      
      loadStudents();
    } catch (error) {
      console.error("Error rejecting student:", error);
      toast({
        title: "Error rejecting student",
        description: error.message || "Failed to reject student profile",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 animate-fade-in">Admin Dashboard</h1>
              <p className="text-gray-600 animate-fade-in">Manage student approvals and view all registered students</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3 animate-fade-in">
              <div className="text-sm py-1 px-3 rounded-full bg-green-100 text-green-800">
                {approvedStudents.length} Approved
              </div>
              <div className="text-sm py-1 px-3 rounded-full bg-yellow-100 text-yellow-800">
                {pendingStudents.length} Pending
              </div>
              <div className="text-sm py-1 px-3 rounded-full bg-red-100 text-red-800">
                {rejectedStudents.length} Rejected
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-elegant border border-gray-100 animate-fade-up">
            <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
              <div className="px-4 sm:px-6 pt-4">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-haca-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-haca-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-3 h-3 bg-haca-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <TabsContent value="pending" className="mt-0">
                      {pendingStudents.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                          No pending student profiles found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {pendingStudents.map((student) => (
                            <StudentCard 
                              key={student.id}
                              student={student}
                              isAdmin={true}
                              onApprove={handleApprove}
                              onReject={handleReject}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="approved" className="mt-0">
                      {approvedStudents.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                          No approved student profiles found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {approvedStudents.map((student) => (
                            <StudentCard 
                              key={student.id}
                              student={student}
                              isAdmin={true}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="rejected" className="mt-0">
                      {rejectedStudents.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                          No rejected student profiles found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {rejectedStudents.map((student) => (
                            <StudentCard 
                              key={student.id}
                              student={student}
                              isAdmin={true}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
