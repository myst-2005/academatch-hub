
import { useState, useEffect } from "react";
import { ApprovalStatus, Student } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useStudentData = () => {
  const { toast } = useToast();
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [rejectedStudents, setRejectedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Load students data on initial render
  useEffect(() => {
    console.log("Loading students data...");
    loadStudents();
  }, []);

  return {
    pendingStudents,
    approvedStudents,
    rejectedStudents,
    isLoading,
    loadStudents,
    handleApprove,
    handleReject
  };
};
