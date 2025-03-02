
import { Button } from "@/components/ui/button";

interface SubmitSectionProps {
  isSubmitting: boolean;
}

export const SubmitSection = ({ isSubmitting }: SubmitSectionProps) => {
  return (
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
  );
};
