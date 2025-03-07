
import { Student } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";

interface StudentCardProps {
  student: Student;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const StudentCard = ({ 
  student, 
  isAdmin = false,
  onApprove,
  onReject
}: StudentCardProps) => {
  return (
    <Card className="glass-card overflow-hidden transition-all hover:translate-y-[-3px]">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">{student.name}</h3>
              <div className="flex items-center mt-1 space-x-2">
                <span className="chip bg-haca-100 text-haca-700">{student.school}</span>
                <span className="chip bg-gray-100 text-gray-700">{student.batch}</span>
                <span className="chip bg-yellow-100 text-yellow-700">{student.yearsOfExperience} {student.yearsOfExperience === 1 ? 'year' : 'years'}</span>
              </div>
            </div>
            {isAdmin && (
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-opacity-10 flex items-center justify-center"
                style={{
                  backgroundColor: student.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 
                                  student.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                                  'rgba(234, 179, 8, 0.1)',
                  color: student.status === 'approved' ? 'rgb(34, 197, 94)' : 
                         student.status === 'rejected' ? 'rgb(239, 68, 68)' : 
                         'rgb(234, 179, 8)'
                }}
              >
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {student.skills.map(skill => (
                <span key={skill.id} className="chip">{skill.name}</span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between items-center">
        <div className="flex space-x-2">
          <a 
            href={student.linkedinUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-sm text-haca-600 hover:text-haca-700 transition-colors"
          >
            <ExternalLink size={16} />
            <span>LinkedIn</span>
          </a>
          
          {student.resumeUrl && (
            <a 
              href={student.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-haca-600 hover:text-haca-700 transition-colors"
            >
              <FileText size={16} />
              <span>Resume</span>
            </a>
          )}
        </div>
        
        {isAdmin && student.status === 'pending' && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onReject && onReject(student.id)}
            >
              Reject
            </Button>
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onApprove && onApprove(student.id)}
            >
              Approve
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default StudentCard;
