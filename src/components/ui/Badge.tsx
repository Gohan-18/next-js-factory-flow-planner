import React from "react";

interface BadgeProps {
  variant: "Available" | "Warning" | "Full";
  children: React.ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  const styles = {
    Available: "bg-green-100 text-green-800 border-green-200",
    Warning: "bg-amber-100 text-amber-800 border-amber-200",
    Full: "bg-red-100 text-red-800 border-red-200 font-bold",
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-xs rounded-full border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
