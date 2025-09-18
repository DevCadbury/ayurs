"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Namaste! I’m your AyurSutra assistant. How can I help today?",
    },
  ]);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    const aiMsg = {
      role: "ai" as const,
      text: "(Demo) I’ll route this to your care plan.",
    };
    setMessages((m) => [...m, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="w-80 h-96 flex flex-col shadow-lg">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="font-medium">AyurSutra Assistant</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "ai" ? "text-sm" : "text-sm text-right"
                    }
                  >
                    <span
                      className={
                        m.role === "ai"
                          ? "inline-block bg-muted px-3 py-2 rounded-md"
                          : "inline-block bg-primary text-primary-foreground px-3 py-2 rounded-md"
                      }
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 flex gap-2 border-t">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <Button onClick={send}>Send</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-primary text-primary-foreground p-4 shadow-lg"
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
