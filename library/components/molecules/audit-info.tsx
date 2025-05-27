import React from 'react';
import { Clock, User } from 'lucide-react';
import { AuditInfo as AuditInfoType } from '@/library/types/dashboard';

interface AuditInfoProps {
  auditInfo: AuditInfoType;
}

export function AuditInfo({ auditInfo }: AuditInfoProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex justify-end mt-3 px-4 pb-3">
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Last updated: {formatDate(auditInfo.updated_at)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span>By: {auditInfo.last_modified_by.full_name}</span>
        </div>
      </div>
    </div>
  );
} 