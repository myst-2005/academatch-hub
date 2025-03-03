
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
    
    // Validate form
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting registration process");
      
      // 1. Create user account - with autoconfirm
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name
          },
          emailRedirectTo: window.location.origin + "/login",
          // Automatically confirm the email for testing purposes
          emailConfirm: true
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

      // Special case for admin email
      if (formData.email === "admin@admin.com") {
        // For admin user, we'll sign them in directly
        console.log("Admin user detected");
        
        const { error: adminSignInError } = await supabase.auth.signInWithPassword({
          email: "admin@admin.com",
          password: formData.password
        });
        
        if (adminSignInError) {
          console.error("Admin sign-in error:", adminSignInError);
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
      
      // Directly sign in the regular user after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (signInError) {
        console.error("Sign-in error after registration:", signInError);
        // Continue with profile creation even if sign-in fails
      } else {
        console.log("User signed in successfully after registration");
      }

      // 2. Process skills (comma-separated)
      const skillNames = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      console.log("Processing skills:", skillNames);
      
      // 3. Create student profile using the user ID from signup
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
          status: 'active' // Changed from 'pending' to 'active'
        })
        .select()
        .single();
      
      if (studentError) {
        console.error("Student profile creation error:", studentError);
        throw new Error("Failed to create student profile. " + studentError.message);
      }
      
      console.log("Student profile created successfully:", studentData);
      
      // 4. Add skills
      for (const skillName of skillNames) {
        console.log("Processing skill:", skillName);
        
        // Try to find existing skill
        let { data: existingSkill, error: skillQueryError } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .maybeSingle();
        
        let skillId;
        
        if (!existingSkill) {
          console.log("Skill doesn't exist, creating new skill:", skillName);
          // Create new skill if it doesn't exist
          const { data: newSkill, error: skillInsertError } = await supabase
            .from('skills')
            .insert({ name: skillName })
            .select()
            .single();
          
          if (skillInsertError) {
            console.error("Skill creation error:", skillInsertError);
            continue; // Just skip this skill rather than failing the whole registration
          }
          
          skillId = newSkill.id;
          console.log("New skill created with ID:", skillId);
        } else {
          skillId = existingSkill.id;
          console.log("Using existing skill with ID:", skillId);
        }
        
        // Associate skill with student
        const { error: linkError } = await supabase
          .from('student_skills')
          .insert({
            student_id: studentData.id,
            skill_id: skillId
          });
        
        if (linkError) {
          console.error("Skill association error:", linkError);
          // Just continue, don't fail the whole registration for one skill
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
      
      // Redirect to student dashboard since we're already signed in
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
