// src/library/hooks/useUserPermissions.ts
import { useMemo } from "react";
import { useAuthStore } from "@/library/store/auth-store";

interface UserPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useUserPermissions(): UserPermissions {
  const { user, isLoading, error } = useAuthStore();
  
  // Derive permissions from the user object
  const permissions = useMemo<UserPermissions>(() => {
    if (!user) {
      return {
        canEdit: false,
        canDelete: false,
        canCreate: false,
        isLoading,
        error: error || null
      };
    }
    
    // Check if user has editor or admin role
    const isEditor = user.role === "editor" ;
    const isAdmin = user.role === "admin";
    
    return {
      canEdit: isEditor,
      canDelete: isAdmin,
      canCreate: true, // Assuming all authenticated users can create
      isLoading,
      error: error || null
    };
  }, [user, isLoading, error]);

  return permissions;
}