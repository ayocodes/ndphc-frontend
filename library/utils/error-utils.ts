// Helper function to extract error message from API response
export const getErrorMessage = (error: any): string => {
  if (!error || !error.response) {
    return "An unknown error occurred";
  }

  // Handle validation error object
  if (error.response.data && typeof error.response.data === "object") {
    if (error.response.data.detail) {
      if (typeof error.response.data.detail === "string") {
        return error.response.data.detail;
      }

      // Handle array of error objects
      if (Array.isArray(error.response.data.detail)) {
        return error.response.data.detail
          .map((err: any) =>
            err.msg ? `${err.loc.join(".")}: ${err.msg}` : JSON.stringify(err)
          )
          .join(", ");
      }

      return JSON.stringify(error.response.data.detail);
    }

    // Try to stringify the entire error data
    try {
      return JSON.stringify(error.response.data);
    } catch (e) {
      return "Invalid server response";
    }
  }

  return error.response.statusText || `Error ${error.response.status}`;
};

// Client-side validation for user forms
export const validateUserForm = (userData: {
  email: string;
  full_name: string;
  password?: string;
  role: string;
  power_plant_id: number | null;
}): string | null => {
  if (!userData.email) {
    return "Email is required";
  }

  if (!userData.email.includes("@")) {
    return "Please enter a valid email address";
  }

  if (!userData.full_name) {
    return "Full name is required";
  }

  if (
    userData.password !== undefined &&
    (!userData.password || userData.password.length < 8)
  ) {
    return "Password must be at least 8 characters long";
  }

  if (
    (userData.role === "operator" || userData.role === "editor") &&
    !userData.power_plant_id
  ) {
    return "Operators and Editors must be assigned to a power plant";
  }

  return null;
};

// Validation for power plant forms
export const validatePowerPlantForm = (plantData: {
  name: string;
  location: string;
  total_capacity: number;
}): string | null => {
  if (!plantData.name) {
    return "Plant name is required";
  }

  if (!plantData.location) {
    return "Location is required";
  }

  if (plantData.total_capacity <= 0) {
    return "Total capacity must be greater than 0";
  }

  return null;
};

// Validation for turbine forms
export const validateTurbineForm = (turbineData: {
  name: string;
  capacity: number;
}): string | null => {
  if (!turbineData.name) {
    return "Turbine name is required";
  }

  if (turbineData.capacity <= 0) {
    return "Capacity must be greater than 0";
  }

  return null;
};

// Helper to create download link for exported data
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
