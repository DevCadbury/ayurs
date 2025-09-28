"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Chatbot from "../chatbot/Chatbot";

interface PageLayoutProps {
  children: React.ReactNode;
  showChatbot?: boolean;
}

export default function PageLayout({
  children,
  showChatbot = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="relative pb-24 md:pb-28 lg:pb-32">{children}</main>
      <Footer />
      {showChatbot && <Chatbot />}
    </div>
  );
}
