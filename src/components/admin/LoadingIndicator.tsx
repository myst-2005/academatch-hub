
import React from "react";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex space-x-2 mb-3">
        <div className="w-3 h-3 bg-haca-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-haca-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-3 h-3 bg-haca-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
      </div>
      <p className="text-gray-500 text-sm">Loading student data...</p>
    </div>
  );
};

export default LoadingIndicator;
