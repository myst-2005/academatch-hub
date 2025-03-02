
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Batch, School } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (!formData.skills.trim()) {
      toast({
        title: "Skills required",
        description: "Please enter at least one skill",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }
      
      // Since we need to bypass RLS, we need to sign in immediately to get proper permissions
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      // 2. Process skills (comma-separated)
      const skillNames = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // 3. Create student profile with service key to bypass RLS (since user might not be confirmed yet)
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
          status: 'pending'
        })
        .select()
        .single();
      
      if (studentError) {
        console.error("Student profile creation error:", studentError);
        throw new Error("Failed to create student profile. " + studentError.message);
      }
      
      // 4. Add skills
      for (const skillName of skillNames) {
        // Try to find existing skill
        let { data: existingSkill, error: skillQueryError } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .single();
        
        let skillId;
        
        if (!existingSkill) {
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
        } else {
          skillId = existingSkill.id;
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
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your profile has been submitted for admin approval",
        duration: 5000,
      });
      
      // Redirect to dashboard - already signed in from earlier step
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Student Registration</h1>
            <p className="mt-2 text-gray-600">Create your profile to be discovered by top recruiters</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-elegant border border-gray-100 p-6 md:p-8 animate-fade-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-elegant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-elegant"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="input-elegant"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="input-elegant"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Select
                    required
                    onValueChange={(value) => setFormData(prev => ({ ...prev, school: value }))}
                  >
                    <SelectTrigger className="input-elegant">
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(School).map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select
                    required
                    onValueChange={(value) => setFormData(prev => ({ ...prev, batch: value }))}
                  >
                    <SelectTrigger className="input-elegant">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Batch).map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="Enter years of experience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  required
                  className="input-elegant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  placeholder="Enter your skills, separated by commas (e.g., React, Flutter, AWS, Docker)"
                  value={formData.skills}
                  onChange={handleInputChange}
                  required
                  className="min-h-[100px] input-elegant"
                />
                <p className="text-xs text-gray-500">
                  Separate each skill with a comma
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  required
                  className="input-elegant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
                <Input
                  id="resumeUrl"
                  name="resumeUrl"
                  type="url"
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  value={formData.resumeUrl}
                  onChange={handleInputChange}
                  className="input-elegant"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide a publicly accessible link to your resume
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-haca-600 hover:bg-haca-700 text-white py-6 h-auto text-base font-medium rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Profile for Approval"}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Your profile will be reviewed by an admin before being visible to recruiters
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentRegistration;
