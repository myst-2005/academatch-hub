
import React from "react";

interface AdminStatsProps {
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({
  approvedCount,
  pendingCount,
  rejectedCount
}) => {
  return (
    <div className="flex items-center space-x-3 animate-fade-in">
      <div className="text-sm py-1 px-3 rounded-full bg-green-100 text-green-800">
        {approvedCount} Approved
      </div>
      <div className="text-sm py-1 px-3 rounded-full bg-yellow-100 text-yellow-800">
        {pendingCount} Pending
      </div>
      <div className="text-sm py-1 px-3 rounded-full bg-red-100 text-red-800">
        {rejectedCount} Rejected
      </div>
    </div>
  );
};

export default AdminStats;
