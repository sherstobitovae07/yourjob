"use client";

import { useState } from "react";
import { dashboardService } from "@/services/dashboardService";

export const useDeleteInternship = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInternship = async (internshipId: number) => {
    setLoading(true);
    setError(null);
    try {
      await dashboardService.deleteMyInternship(internshipId);
    } catch (err) {
      console.error("deleteInternship error", err);
      const anyErr = err as any;
      const serverMsg = anyErr?.response?.data?.detail || anyErr?.response?.data?.message || anyErr?.message;
      setError(serverMsg || "Ошибка при удалении стажировки");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteInternship, loading, error };
};

export default useDeleteInternship;
