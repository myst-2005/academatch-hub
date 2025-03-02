
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useToast } from "@/components/ui/use-toast";
import { School, ApprovalStatus, Batch } from "@/lib/types";

interface SkillType {
  id: string;
  name: string;
}

interface StudentProfile {
  id: string;
  name: string;
  batch: Batch;
  school: School;
  years_of_experience: number;
  linkedin_url: string;
  resume_url: string | null;
  status: ApprovalStatus;
  created_at: string;
  skills: SkillType[];
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    
    if (user) {
      fetchStudentProfile();
    }
  }, [user, loading]);
  
  const fetchStudentProfile = async () => {
    try {
      // Fetch student profile
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (studentError) {
        if (studentError.code === 'PGRST116') {
          // No profile found - this is a new user
          toast({
            title: "No profile found",
            description: "Please complete your profile registration",
            duration: 3000,
          });
          navigate("/registration");
          return;
        }
        throw studentError;
      }
      
      if (!studentData) {
        toast({
          title: "No profile found",
          description: "Please complete your profile registration",
          duration: 3000,
        });
        navigate("/registration");
        return;
      }
      
      // Fetch student skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('student_skills')
        .select(`
          skill_id,
          skills:skills(id, name)
        `)
        .eq('student_id', studentData.id);
      
      if (skillsError) throw skillsError;
      
      // Format the profile with skills
      const formattedProfile: StudentProfile = {
        id: studentData.id,
        name: studentData.name,
        batch: studentData.batch as Batch,
        school: studentData.school as School,
        years_of_experience: studentData.years_of_experience,
        linkedin_url: studentData.linkedin_url,
        resume_url: studentData.resume_url,
        status: studentData.status as ApprovalStatus,
        created_at: studentData.created_at,
        skills: skillsData ? skillsData.map((item: any) => item.skills) : []
      };
      
      setProfile(formattedProfile);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: error.message || "Failed to load your profile",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-haca-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your profile and track your approval status
            </p>
          </div>
          
          {profile ? (
            <div className="animate-fade-up">
              <Card className="shadow-elegant border border-gray-100 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-haca-50 to-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl">{profile.name}</CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap gap-2">
                        <Chip variant="secondary">{profile.school}</Chip>
                        <Chip variant="secondary">{profile.batch}</Chip>
                        <Chip variant="secondary">{profile.years_of_experience} {profile.years_of_experience === 1 ? 'year' : 'years'} experience</Chip>
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-3 text-sm font-medium">Status:</div>
                      <Chip 
                        variant={
                          profile.status === ApprovalStatus.Approved 
                            ? "success" 
                            : profile.status === ApprovalStatus.Rejected 
                            ? "danger" 
                            : "warning"
                        }
                        className="uppercase"
                      >
                        {profile.status}
                      </Chip>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Chip key={skill.id} variant="primary">
                            {skill.name}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">LinkedIn Profile</h3>
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-haca-600 hover:text-haca-800 hover:underline"
                        >
                          {profile.linkedin_url}
                        </a>
                      </div>
                      
                      {profile.resume_url && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Resume</h3>
                          <a 
                            href={profile.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-haca-600 hover:text-haca-800 hover:underline"
                          >
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Profile ID</h3>
                      <p className="text-sm text-gray-700">{profile.id}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Date Created</h3>
                      <p className="text-sm text-gray-700">
                        {new Date(profile.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t border-gray-100 flex justify-between">
                  <div className="text-sm text-gray-500">
                    {profile.status === ApprovalStatus.Pending ? (
                      "Your profile is awaiting admin approval"
                    ) : profile.status === ApprovalStatus.Approved ? (
                      "Your profile is live and visible to recruiters"
                    ) : (
                      "Your profile has been rejected. Please contact the admin."
                    )}
                  </div>
                </CardFooter>
              </Card>
              
              {profile.status === ApprovalStatus.Rejected && (
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate("/registration")}
                    variant="outline"
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">No profile found. Please complete your registration.</p>
              <Button 
                onClick={() => navigate("/registration")} 
                className="mt-4 bg-haca-600 hover:bg-haca-700"
              >
                Register Now
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
