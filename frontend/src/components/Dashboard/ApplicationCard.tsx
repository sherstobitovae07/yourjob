import React from "react";
import type { ApplicationItem } from "../../types/dashboard";

interface ApplicationCardProps {
  application: ApplicationItem;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const statusColor: Record<string, string> = {
    PENDING: "#f59e0b",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
  };

  const statusText: Record<string, string> = {
    PENDING: "На рассмотрении",
    APPROVED: "Одобрено",
    REJECTED: "Отклонено",
  };

  const status = (application.status as keyof typeof statusColor) || "PENDING";

  return (
    <div style={{ 
      background: "#ffffff", 
      borderRadius: "12px", 
      padding: "16px", 
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      borderLeft: `4px solid ${statusColor[status]}`
    }}>
      <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "18px" }}>
        {application.internship_title}
      </h3>
      <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px" }}>
        {application.company_name}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ 
          padding: "4px 8px", 
          background: statusColor[status] + "20", 
          color: statusColor[status],
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "600"
        }}>
          {statusText[status]}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
          {application.applied_at ? new Date(application.applied_at).toLocaleDateString("ru-RU") : "-"}
        </span>
      </div>
    </div>
  );
}
