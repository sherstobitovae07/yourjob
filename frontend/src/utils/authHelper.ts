
import type { UserRole } from "../types/auth";
import { getCookie } from "./cookies";
export const getStoredUserRole = (): UserRole | null => {
  if (typeof window === "undefined") return null;
  try {
    const roleStr = localStorage.getItem("user_role");
    if (roleStr) {
      const normalized = roleStr.toUpperCase() as UserRole;
      const validRoles: UserRole[] = ["STUDENT", "EMPLOYER", "ADMIN"];
      if (validRoles.includes(normalized)) {
        return normalized;
      }
    }
  } catch (e) {
    console.error("Failed to get user role from localStorage:", e);
  }
  return null;
};
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!getCookie("access_token");
};
export const isStudent = (): boolean => getStoredUserRole() === "STUDENT";
export const isEmployer = (): boolean => getStoredUserRole() === "EMPLOYER";
export const isAdmin = (): boolean => getStoredUserRole() === "ADMIN";
