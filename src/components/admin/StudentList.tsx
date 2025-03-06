
import React from "react";
import { Student } from "@/lib/types";
import StudentCard from "@/components/StudentCard";

interface StudentListProps {
  students: Student[];
  isAdmin?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  emptyMessage: string;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  isAdmin = false,
  onApprove,
  onReject,
  emptyMessage
}) => {
  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {students.map((student) => (
        <StudentCard 
          key={student.id}
          student={student}
          isAdmin={isAdmin}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default StudentList;
