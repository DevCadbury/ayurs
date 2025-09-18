"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import {
  getDoctors,
  getDoctorAdminThread,
  listChatMessages,
  sendChatMessage,
} from "@/lib/api";

export default function AdminMessagesPage() {
  const { uid, token } = useAuthStore();
  const [doctors, setDoctors] = useState<Array<Record<string, unknown>>>([]);
  const [selectedDoctorUid] = useState<string>("");
  const selectedDoctor = useMemo(
    () =>
      doctors.find(
        (d: Record<string, unknown>) =>
          String(d.uid || d._id) === String(selectedDoctorUid)
      ),
    [doctors, selectedDoctorUid]
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [query, setQuery] = useState("");
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const endRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  function scrollToBottom() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }

  async function loadDoctors() {
    if (!token) return;
    setLoadingDoctors(true);
    setError(null);
    try {
      const docs = await getDoctors(token);
      const approved = (docs || []).filter(
        (d: Record<string, unknown>) =>
          d.role === "doctor" && d.isApproved !== false
      );
      setDoctors(approved);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function openChat(doctorUidParam?: string) {
    const targetUid = doctorUidParam || selectedDoctorUid;
    if (!targetUid || !token) return;
    setLoadingMessages(true);
    setError(null);
    try {
      const t = await getDoctorAdminThread(targetUid, token);
      setActiveChatId(t.chatId);
      const data = await listChatMessages(t.chatId, token);
      setMessages(data.messages || []);
      // mark unread as read
      setUnreadByChat((prev) => ({ ...prev, [t.chatId]: 0 }));
      setTimeout(scrollToBottom, 0);
    } catch (err: unknown) {
      setMessages([]);
      setError(err?.message || "Failed to open chat");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function loadMessages(chatId: string) {
    if (!token) return;
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await listChatMessages(chatId, token);
      setMessages(res.messages || []);
      setTimeout(scrollToBottom, 0);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend() {
    if (!activeChatId || !uid || !token) return;
    if (!text.trim() && !attachmentUrl.trim()) return;
    try {
      const res = await sendChatMessage(
        activeChatId,
        {
          senderId: uid,
          text: text.trim() || undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        },
        token
      );
      setMessages(res.messages || []);
      setText("");
      setAttachmentUrl("");
      setTimeout(scrollToBottom, 0);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to send message");
    }
  }

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // SSE live updates for open chat
  useEffect(() => {
    if (!token) return;
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || "https://ayur-api.vercel.app";
    const es = new EventSource(`${apiBase}/api/events`);
    es.addEventListener("message.created", async (ev: MessageEvent) => {
      try {
        const data = JSON.parse((ev as any).data);
        const evChatId = data?.payload?.chatId;
        if (!evChatId) return;
        if (evChatId === activeChatId) {
          await loadMessages(evChatId);
        } else {
          // increment unread for other chats
          setUnreadByChat((prev) => ({
            ...prev,
            [evChatId]: (prev[evChatId] || 0) + 1,
          }));
        }
      } catch {}
    });
    return () => es.close();
  }, [token, activeChatId, loadMessages]);

  // Derived: filtered doctors by search query
  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) =>
      (d.name || d.displayName || d.email || "")
        .toString()
        .toLowerCase()
        .includes(q)
    );
  }, [doctors, query]);

  function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDoctors ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Search doctors…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="border rounded-md divide-y max-h-[60vh] overflow-auto">
                    {filteredDoctors.length === 0 ? (
                      <div className="text-sm text-gray-500 p-3">
                        No doctors found.
                      </div>
                    ) : (
                      filteredDoctors.map((d: Record<string, unknown>) => {
                        const did = String(d.uid || d._id);
                        const unread = Object.values(unreadByChat)[0];
                        return (
                          <button
                            key={d._id || d.uid || d.email}
                            className="w-full text-left p-3 hover:bg-accent/50 flex items-center justify-between"
                            onClick={() => openChat(did)}
                          >
                            <span className="truncate pr-2">
                              {d.name || d.displayName || d.email}
                            </span>
                            {!!unread && (
                              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-green-600 text-white text-[10px] min-w-5 h-5 px-1">
                                {unread}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Messages
                {selectedDoctor
                  ? ` – ${
                      selectedDoctor.name ||
                      selectedDoctor.displayName ||
                      selectedDoctor.email
                    }`
                  : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-auto space-y-3 border rounded-md p-3">
                  {!activeChatId ? (
                    <div className="text-sm text-gray-500">
                      Select a doctor and open chat.
                    </div>
                  ) : loadingMessages ? (
                    <div className="text-sm text-gray-500">
                      Loading messages…
                    </div>
                  ) : (messages || []).length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No messages yet.
                    </div>
                  ) : (
                    (messages || []).map(
                      (m: Record<string, unknown>, i: number) => (
                        <div
                          key={m?._id || m?.id || m?.createdAt || i}
                          className="flex items-start gap-2"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={m?.sender?.avatar}
                              alt={
                                m?.sender?.name ||
                                selectedDoctor?.name ||
                                "User"
                              }
                            />
                            <AvatarFallback>
                              {(m?.sender?.name || "U")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-accent rounded-md px-3 py-2 max-w-[75%]">
                            <div className="text-xs text-gray-500 mb-0.5">
                              {m?.sender?.name ||
                                (m?.sender?.uid === selectedDoctorUid
                                  ? selectedDoctor?.name ||
                                    selectedDoctor?.displayName ||
                                    selectedDoctor?.email
                                  : uid
                                  ? "Admin"
                                  : "User")}
                            </div>
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {m?.text}
                            </div>
                          </div>
                        </div>
                      )
                    )
                  )}
                  <div ref={endRef} />
                </div>
                <div className="mt-3 flex gap-2 items-end">
                  <Textarea
                    ref={composerRef}
                    placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onComposerKeyDown}
                    rows={2}
                  />
                  <Input
                    placeholder="Attachment URL (optional)"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      !activeChatId || (!text.trim() && !attachmentUrl.trim())
                    }
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
                {error && (
                  <div className="text-xs text-red-600 mt-2">{error}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
