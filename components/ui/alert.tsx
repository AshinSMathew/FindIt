import React from 'react';

interface AlertProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const Alert: React.FC<AlertProps> = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`rounded-lg border p-4 ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default function AlertDemo() {
  return (
    <div className="p-6 space-y-4">
      {/* Error Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          This is an error message
        </AlertDescription>
      </Alert>

      {/* Success Alert */}
      <Alert className="border-green-200 bg-green-50">
        <AlertDescription className="text-green-800">
          This is a success message
        </AlertDescription>
      </Alert>

      {/* Default Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800">
          This is an info message
        </AlertDescription>
      </Alert>
    </div>
  );
}