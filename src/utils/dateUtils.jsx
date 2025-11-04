// utils/dateUtils.js
export const parseDOB = (dob) => {
  if (!dob) return null;

  // If it's already a Date object
  if (dob instanceof Date) return dob;

  // If it's ISO format -> works directly
  if (typeof dob === "string" && /^\d{4}-\d{2}-\d{2}T/.test(dob)) {
    return new Date(dob);
  }

  // If it's MM/DD/YYYY
  if (typeof dob === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dob)) {
    const [month, day, year] = dob.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  // Fallback: try native Date parsing
  return new Date(dob);
};
