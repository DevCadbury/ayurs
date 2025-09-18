"use client";
import AIChatbot from "@/components/chatbot/AIChatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="w-full px-4 md:px-6 py-6">{children}</div>
      <AIChatbot />
    </div>
  );
}
