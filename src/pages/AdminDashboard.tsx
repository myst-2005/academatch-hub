
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentData } from "@/hooks/useStudentData";
import AdminStats from "@/components/admin/AdminStats";
import StudentList from "@/components/admin/StudentList";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  const {
    pendingStudents,
    approvedStudents,
    rejectedStudents,
    isLoading,
    error,
    loadStudents,
    handleApprove,
    handleReject
  } = useStudentData();
  
  const [activeTab, setActiveTab] = useState("pending");
  
  const handleRefresh = () => {
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
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                Refresh
              </Button>
              
              <AdminStats 
                approvedCount={approvedStudents.length}
                pendingCount={pendingStudents.length}
                rejectedCount={rejectedStudents.length}
              />
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
                  <LoadingIndicator />
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <AlertTriangle size={48} className="text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button onClick={handleRefresh}>Try Again</Button>
                  </div>
                ) : (
                  <>
                    <TabsContent value="pending" className="mt-0">
                      <StudentList 
                        students={pendingStudents}
                        isAdmin={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        emptyMessage="No pending student profiles found"
                      />
                    </TabsContent>
                    
                    <TabsContent value="approved" className="mt-0">
                      <StudentList 
                        students={approvedStudents}
                        isAdmin={true}
                        emptyMessage="No approved student profiles found"
                      />
                    </TabsContent>
                    
                    <TabsContent value="rejected" className="mt-0">
                      <StudentList 
                        students={rejectedStudents}
                        isAdmin={true}
                        emptyMessage="No rejected student profiles found"
                      />
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
