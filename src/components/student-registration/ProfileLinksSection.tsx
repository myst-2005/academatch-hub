
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileLinksSectionProps {
  linkedinUrl: string;
  resumeUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileLinksSection = ({ linkedinUrl, resumeUrl, onChange }: ProfileLinksSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={linkedinUrl}
          onChange={onChange}
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
          value={resumeUrl}
          onChange={onChange}
          className="input-elegant"
        />
        <p className="text-xs text-gray-500 mt-1">
          Please provide a publicly accessible link to your resume
        </p>
      </div>
    </>
  );
};
