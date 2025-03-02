
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Batch, School, Skill } from "@/lib/types";
import { addStudent, SKILLS } from "@/lib/mockData";
import Navbar from "@/components/Navbar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    school: "",
    yearsOfExperience: "0",
    linkedinUrl: "",
    resumeUrl: ""
  });
  
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSkillToggle = (skill: Skill) => {
    setSelectedSkills(prev => {
      const exists = prev.some(s => s.id === skill.id);
      return exists
        ? prev.filter(s => s.id !== skill.id)
        : [...prev, skill];
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSkills.length === 0) {
      toast({
        title: "Validation error",
        description: "Please select at least one skill",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        addStudent({
          name: formData.name,
          batch: formData.batch as Batch,
          school: formData.school as School,
          skills: selectedSkills,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          linkedinUrl: formData.linkedinUrl,
          resumeUrl: formData.resumeUrl || undefined
        });
        
        toast({
          title: "Registration successful",
          description: "Your profile has been submitted for admin approval",
          duration: 5000,
        });
        
        navigate("/");
      } catch (error) {
        toast({
          title: "Registration failed",
          description: "An error occurred while registering",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };
  
  // Group skills by category
  const codingSkills = SKILLS.slice(0, 8);
  const designSkills = SKILLS.slice(8, 12);
  const marketingSkills = SKILLS.slice(12, 16);

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
              
              <div className="space-y-4">
                <Label>Skills</Label>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Coding Skills</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {codingSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill.id}`}
                            checked={selectedSkills.some(s => s.id === skill.id)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <label
                            htmlFor={`skill-${skill.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {skill.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Design Skills</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {designSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill.id}`}
                            checked={selectedSkills.some(s => s.id === skill.id)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <label
                            htmlFor={`skill-${skill.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {skill.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Marketing Skills</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {marketingSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill.id}`}
                            checked={selectedSkills.some(s => s.id === skill.id)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <label
                            htmlFor={`skill-${skill.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {skill.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
