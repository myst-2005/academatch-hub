
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ExperienceSectionProps {
  yearsOfExperience: string;
  skills: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ExperienceSection = ({ yearsOfExperience, skills, onChange }: ExperienceSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
        <Input
          id="yearsOfExperience"
          name="yearsOfExperience"
          type="number"
          min="0"
          max="20"
          placeholder="Enter years of experience"
          value={yearsOfExperience}
          onChange={onChange}
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
          value={skills}
          onChange={onChange}
          required
          className="min-h-[100px] input-elegant"
        />
        <p className="text-xs text-gray-500">
          Separate each skill with a comma
        </p>
      </div>
    </>
  );
};
