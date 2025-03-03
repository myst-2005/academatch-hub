
import Navbar from "@/components/Navbar";
import { useStudentRegistration } from "@/hooks/useStudentRegistration";
import { PersonalInfoSection } from "@/components/student-registration/PersonalInfoSection";
import { PasswordSection } from "@/components/student-registration/PasswordSection";
import { EducationSection } from "@/components/student-registration/EducationSection";
import { ExperienceSection } from "@/components/student-registration/ExperienceSection";
import { ProfileLinksSection } from "@/components/student-registration/ProfileLinksSection";
import { SubmitSection } from "@/components/student-registration/SubmitSection";
import { SkillAnalysisSection } from "@/components/student-registration/SkillAnalysisSection";

const StudentRegistration = () => {
  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleSelectChange
  } = useStudentRegistration();

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
              <PersonalInfoSection 
                name={formData.name}
                email={formData.email}
                onChange={handleInputChange}
              />
              
              <PasswordSection 
                password={formData.password}
                confirmPassword={formData.confirmPassword}
                onChange={handleInputChange}
              />
              
              <EducationSection 
                school={formData.school}
                batch={formData.batch}
                onSelectChange={handleSelectChange}
              />
              
              <ExperienceSection 
                yearsOfExperience={formData.yearsOfExperience}
                skills={formData.skills}
                onChange={handleInputChange}
              />
              
              {formData.skills.trim() && (
                <SkillAnalysisSection skills={formData.skills} />
              )}
              
              <ProfileLinksSection 
                linkedinUrl={formData.linkedinUrl}
                resumeUrl={formData.resumeUrl}
                onChange={handleInputChange}
              />
              
              <SubmitSection isSubmitting={isSubmitting} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentRegistration;
