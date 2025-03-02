
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getCurrentUser, 
  getPendingStudents, 
  updateStudentStatus, 
  getApprovedStudents, 
  getStudents 
} from "@/lib/mockData";
import { ApprovalStatus, Student } from "@/lib/types";
import Navbar from "@/components/Navbar";
import StudentCard from "@/components/StudentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [rejectedStudents, setRejectedStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Check if user is logged in and is admin
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      toast({
        title: "Access denied",
        description: "You must be logged in as an admin to view this page",
        variant: "destructive",
        duration: 3000,
      });
      navigate("/login");
    }
  }, [navigate, toast]);
  
  // Load students data
  useEffect(() => {
    loadStudents();
  }, []);
  
  const loadStudents = () => {
    const allStudents = getStudents();
    setPendingStudents(allStudents.filter(s => s.status === ApprovalStatus.Pending));
    setApprovedStudents(allStudents.filter(s => s.status === ApprovalStatus.Approved));
    setRejectedStudents(allStudents.filter(s => s.status === ApprovalStatus.Rejected));
  };
  
  const handleApprove = (id: string) => {
    updateStudentStatus(id, ApprovalStatus.Approved);
    toast({
      title: "Student approved",
      description: "The student profile has been approved successfully",
      duration: 3000,
    });
    loadStudents();
  };
  
  const handleReject = (id: string) => {
    updateStudentStatus(id, ApprovalStatus.Rejected);
    toast({
      title: "Student rejected",
      description: "The student profile has been rejected",
      duration: 3000,
    });
    loadStudents();
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
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
