// src/components/molecules/form-section.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/library/components/atoms/card";

interface FormSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({ title, icon: Icon, description, children, className = "" }: FormSectionProps) => (
  <Card className={`shadow-sm border-gray-200 ${className}`}>
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center space-x-2 text-lg">
        <Icon className="h-5 w-5 text-blue-600" />
        <span>{title}</span>
      </CardTitle>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);