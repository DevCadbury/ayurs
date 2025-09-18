"use client";
import PatientNavbar from "@/components/dashboard/PatientNavbar";

export default function PatientSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PatientNavbar />
      <div className="w-full px-4 md:px-6 pt-6 pb-10">{children}</div>
    </div>
  );
}
