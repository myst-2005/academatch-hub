import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Batch, School } from "@/lib/types";

interface StudentFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  batch: string;
  school: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  resumeUrl: string;
  skills: string;
}

export const useStudentRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    batch: "",
    school: "",
    yearsOfExperience: "0",
    linkedinUrl: "",
    resumeUrl: "",
    skills: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!formData.skills.trim()) {
      toast({
        title: "Skills required",
        description: "Please enter at least one skill",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting registration process");
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            is_super_admin: formData.email === "admin@admin.com"
          }
        }
      });
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error("No user data returned");
        throw new Error("Failed to create user account");
      }
      
      console.log("User created successfully, user ID:", authData.user.id);

      if (formData.email === "admin@admin.com") {
        console.log("Admin user detected");
        
        const { error: adminSignInError } = await supabase.auth.signInWithPassword({
          email: "admin@admin.com",
          password: formData.password
        });
        
        if (adminSignInError) {
          console.error("Admin sign-in error:", adminSignInError);
          throw adminSignInError;
        } else {
          toast({
            title: "Admin account created and signed in",
            description: "Welcome, admin!",
            duration: 3000,
          });
          navigate("/admin-dashboard");
          return;
        }
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (signInError) {
        console.error("Sign-in error after registration:", signInError);
        throw signInError;
      } else {
        console.log("User signed in successfully after registration");
      }

      const skillNames = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      console.log("Processing skills:", skillNames);
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          name: formData.name,
          batch: formData.batch,
          school: formData.school,
          years_of_experience: parseInt(formData.yearsOfExperience),
          linkedin_url: formData.linkedinUrl,
          resume_url: formData.resumeUrl || null,
          status: 'active'
        })
        .select()
        .single();
      
      if (studentError) {
        console.error("Student profile creation error:", studentError);
        throw new Error("Failed to create student profile. " + studentError.message);
      }
      
      console.log("Student profile created successfully:", studentData);
      
      for (const skillName of skillNames) {
        console.log("Processing skill:", skillName);
        
        let { data: existingSkill, error: skillQueryError } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .maybeSingle();
        
        let skillId;
        
        if (!existingSkill) {
          console.log("Skill doesn't exist, creating new skill:", skillName);
          const { data: newSkill, error: skillInsertError } = await supabase
            .from('skills')
            .insert({ name: skillName })
            .select()
            .single();
          
          if (skillInsertError) {
            console.error("Skill creation error:", skillInsertError);
            continue;
          }
          
          skillId = newSkill.id;
          console.log("New skill created with ID:", skillId);
        } else {
          skillId = existingSkill.id;
          console.log("Using existing skill with ID:", skillId);
        }
        
        const { error: linkError } = await supabase
          .from('student_skills')
          .insert({
            student_id: studentData.id,
            skill_id: skillId
          });
        
        if (linkError) {
          console.error("Skill association error:", linkError);
        } else {
          console.log("Skill associated with student successfully");
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your profile has been created successfully.",
        duration: 5000,
      });
      
      console.log("Registration completed successfully");
      
      navigate("/student-dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred while registering",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleSelectChange
  };
};
