
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { School, Batch } from "@/lib/types";

interface EducationSectionProps {
  school: string;
  batch: string;
  onSelectChange: (field: string, value: string) => void;
}

export const EducationSection = ({ school, batch, onSelectChange }: EducationSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="school">School</Label>
        <Select
          required
          value={school}
          onValueChange={(value) => onSelectChange('school', value)}
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
          value={batch}
          onValueChange={(value) => onSelectChange('batch', value)}
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
  );
};
