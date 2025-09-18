"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  Stethoscope,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  Plus,
  Edit,
  Trash2,
  Send,
  Bell,
  FileText,
  Settings,
  Bot,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  MoreHorizontal,
  Phone,
  Video,
  Mail,
  Calendar as CalendarIcon,
  Activity,
  Heart,
  Brain,
  Zap,
  Shield,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  Save,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import {
  getTherapies,
  updateAppointmentStatus,
  listMessageThreads,
  listChatMessages,
  sendChatMessage,
  createTherapy,
  updateTherapy,
  deleteTherapy,
  getDoctorAdminThread,
  getCurrentUser,
  updateCurrentUser,
  getAllAppointments,
  updateAppointment,
  listDoctorThreads,
  createUserAdmin,
} from "@/lib/api";

// Enhanced mock data for comprehensive doctor dashboard
const mockData = {
  todayAppointments: [
    {
      id: 1,
      time: "9:00 AM",
      patient: "John Smith",
      patientId: "p1",
      therapy: "Abhyanga",
      therapyId: "t1",
      status: "completed",
      duration: "60 min",
      notes: "Patient responded well to treatment",
      progress: 85,
    },
    {
      id: 2,
      time: "11:00 AM",
      patient: "Sarah Johnson",
      patientId: "p2",
      therapy: "Shirodhara",
      therapyId: "t2",
      status: "in-progress",
      duration: "45 min",
      notes: "Currently in session",
      progress: 70,
    },
    {
      id: 3,
      time: "2:00 PM",
      patient: "Mike Chen",
      patientId: "p3",
      therapy: "Panchakarma",
      therapyId: "t3",
      status: "upcoming",
      duration: "90 min",
      notes: "Pre-session preparation needed",
      progress: 60,
    },
    {
      id: 4,
      time: "4:00 PM",
      patient: "Emily Davis",
      patientId: "p4",
      therapy: "Marma Therapy",
      therapyId: "t4",
      status: "delayed",
      duration: "30 min",
      notes: "Patient running 15 minutes late",
      progress: 45,
    },
  ],
  patients: [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1-555-0123",
      lastVisit: "2024-01-10",
      progress: 85,
      nextAppointment: "2024-01-15",
      status: "active",
      age: 45,
      conditions: ["Hypertension", "Stress"],
      totalSessions: 12,
      completedSessions: 10,
      therapyHistory: ["Abhyanga", "Shirodhara"],
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1-555-0124",
      lastVisit: "2024-01-12",
      progress: 70,
      nextAppointment: "2024-01-17",
      status: "active",
      age: 38,
      conditions: ["Anxiety", "Insomnia"],
      totalSessions: 8,
      completedSessions: 6,
      therapyHistory: ["Shirodhara", "Marma Therapy"],
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1-555-0125",
      lastVisit: "2024-01-08",
      progress: 60,
      nextAppointment: "2024-01-20",
      status: "active",
      age: 52,
      conditions: ["Diabetes", "Chronic Pain"],
      totalSessions: 15,
      completedSessions: 12,
      therapyHistory: ["Panchakarma", "Abhyanga"],
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@email.com",
      phone: "+1-555-0126",
      lastVisit: "2024-01-14",
      progress: 45,
      nextAppointment: "2024-01-18",
      status: "active",
      age: 29,
      conditions: ["Depression", "Migraine"],
      totalSessions: 6,
      completedSessions: 4,
      therapyHistory: ["Marma Therapy", "Abhyanga"],
    },
  ],
  therapies: [
    {
      id: "t1",
      name: "Abhyanga",
      description: "Traditional oil massage therapy",
      duration: 60,
      price: 120,
      category: "Massage",
      status: "active",
      requirements: "Empty stomach, comfortable clothing",
    },
    {
      id: "t2",
      name: "Shirodhara",
      description: "Oil pouring therapy for head",
      duration: 45,
      price: 100,
      category: "Head Therapy",
      status: "active",
      requirements: "Clean hair, no makeup",
    },
    {
      id: "t3",
      name: "Panchakarma",
      description: "Five-fold detoxification therapy",
      duration: 90,
      price: 200,
      category: "Detox",
      status: "active",
      requirements: "Pre-treatment consultation required",
    },
    {
      id: "t4",
      name: "Marma Therapy",
      description: "Energy point therapy",
      duration: 30,
      price: 80,
      category: "Energy",
      status: "active",
      requirements: "Loose clothing, empty stomach",
    },
  ],
  messages: [
    {
      id: 1,
      patientId: "p1",
      patientName: "John Smith",
      message: "Thank you for today's session. I feel much better!",
      timestamp: "2 hours ago",
      isRead: false,
      type: "text",
    },
    {
      id: 2,
      patientId: "p2",
      patientName: "Sarah Johnson",
      message: "Can we reschedule tomorrow's appointment to 3 PM?",
      timestamp: "4 hours ago",
      isRead: true,
      type: "text",
    },
    {
      id: 3,
      patientId: "p3",
      patientName: "Mike Chen",
      message: "I have some questions about my treatment plan",
      timestamp: "1 day ago",
      isRead: false,
      type: "text",
    },
  ],
  notifications: [
    {
      id: 1,
      type: "session_reminder",
      title: "Session Starting Soon",
      message: "Sarah Johnson's Shirodhara session starts in 15 minutes",
      timestamp: "5 minutes ago",
      isRead: false,
      priority: "high",
    },
    {
      id: 2,
      type: "patient_feedback",
      title: "New Patient Feedback",
      message: "John Smith submitted feedback for completed session",
      timestamp: "1 hour ago",
      isRead: true,
      priority: "medium",
    },
    {
      id: 3,
      type: "session_delayed",
      title: "Session Delayed",
      message: "Emily Davis is running 15 minutes late",
      timestamp: "2 hours ago",
      isRead: false,
      priority: "high",
    },
  ],
  recentActivities: [
    {
      id: 1,
      action: "Completed therapy session",
      patient: "John Smith",
      time: "2 hours ago",
      type: "completed",
      details: "Abhyanga session - 60 minutes",
    },
    {
      id: 2,
      action: "Updated patient progress",
      patient: "Sarah Johnson",
      time: "4 hours ago",
      type: "update",
      details: "Progress increased from 65% to 70%",
    },
    {
      id: 3,
      action: "Scheduled new appointment",
      patient: "Mike Chen",
      time: "1 day ago",
      type: "scheduled",
      details: "Panchakarma session - 90 minutes",
    },
    {
      id: 4,
      action: "Marked session as delayed",
      patient: "Emily Davis",
      time: "2 hours ago",
      type: "delayed",
      details: "Marma Therapy - 15 minute delay",
    },
  ],
  analytics: {
    totalSessions: 156,
    completedSessions: 142,
    delayedSessions: 8,
    cancelledSessions: 6,
    averageSessionDuration: 52,
    patientSatisfaction: 4.7,
    monthlyRevenue: 18750,
    topTherapies: [
      { name: "Abhyanga", count: 45, revenue: 5400 },
      { name: "Shirodhara", count: 38, revenue: 3800 },
      { name: "Panchakarma", count: 25, revenue: 5000 },
      { name: "Marma Therapy", count: 20, revenue: 1600 },
    ],
  },
};

export default function DoctorDashboard() {
  const { uid, role, displayName, email } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  // View patient dialog state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<Record<string, unknown> | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);
  const [detailsSession, setDetailsSession] = useState<Record<string, unknown> | null>(null);
  // Threads for this doctor (built from backend)
  const [doctorThreads, setDoctorThreads] = useState<
    Array<{ chatId: string; patient: Record<string, unknown> }>
  >([]);

  const openViewPatient = (patient: Record<string, unknown>) => {
    setViewPatient(patient);
    setIsViewOpen(true);
  };

  const openAddNotes = (session: Record<string, unknown>) => {
    setActiveSessionId(session.id);
    setNotesText(session.notes || "");
    setIsNotesOpen(true);
  };

  const saveNotes = async () => {
    if (!activeSessionId) return;
    try {
      const token = useAuthStore.getState().token as string | null;
      if (token) {
        await updateAppointment(activeSessionId, { notes: notesText }, token);
      }
      toast.success("Notes saved");
      setIsNotesOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Failed to save notes");
    }
  };

  const openSessionDetails = (session: Record<string, unknown>) => {
    setDetailsSession(session);
    setIsSessionDetailsOpen(true);
  };

  // Load threads for this doctor from backend so new patient messages appear
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  // Load cached contacts first for persistence across refreshes
  useEffect(() => {
    try {
      if (!uid) return;
      const raw = localStorage.getItem(`doctor_threads_${uid}`) || "";
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached) && cached.length) setDoctorThreads(cached);
      }
    } catch {}
  }, [uid]);
  useEffect(() => {
    const loadDoctorThreads = async () => {
      try {
        const token = (useAuthStore.getState().token as string) || "";
        if (!uid || !token) return;
        // Load all doctor chat threads directly from backend, always available
        const threads = await listDoctorThreads(String(uid), token);
        setDoctorThreads(threads || []);
      } catch {}
    };
    loadDoctorThreads();
  }, [uid]);

  // Persist contacts after any update
  useEffect(() => {
    try {
      if (!uid) return;
      localStorage.setItem(
        `doctor_threads_${uid}`,
        JSON.stringify(doctorThreads || [])
      );
    } catch {}
  }, [doctorThreads, uid]);

  // Realtime refresh on new messages
  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || "https://ayur-api.vercel.app";
    const es = new EventSource(`${apiBase}/api/events`);
    const onMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data || "{}");
        if (data?.type === "message.created") {
          // Reload threads so new patient chats are visible
          (async () => {
            try {
              const token = (useAuthStore.getState().token as string) || "";
              if (!uid || !token) return;
              const eventChatId = String(data?.payload?.chatId || "");
              if (eventChatId) {
                try {
                  const cm = await listChatMessages(eventChatId, token, uid);
                  const parts = (cm.participants || []) as Record<string, unknown>[];
                  const patientP =
                    parts.find((p: Record<string, unknown>) => p?.role === "patient") || {};
                  // Merge or prepend this chat into the doctorThreads list
                  setDoctorThreads((prev) => {
                    const without = (prev || []).filter(
                      (t) => t.chatId !== eventChatId
                    );
                    return [
                      {
                        chatId: eventChatId,
                        patient: {
                          name:
                            patientP?.name ||
                            patientP?.displayName ||
                            patientP?.email ||
                            patientP?.uid ||
                            "Patient",
                          email: patientP?.email,
                          uid: patientP?.uid,
                        },
                      },
                      ...without,
                    ];
                  });
                  if (activeChatId && eventChatId === activeChatId) {
                    const msgs = await listChatMessages(
                      activeChatId,
                      token,
                      uid
                    );
                    setChatMessages(msgs.messages || []);
                  }
                } catch {}
              }
              // Also refresh full list
              try {
                const threads = await listMessageThreads(String(uid), token);
                const normalized = (threads || []).map((t: Record<string, unknown>) => ({
                  chatId: t.chatId,
                  patient: t.patient || t.doctor || {},
                }));
                setDoctorThreads((prev) => {
                  const map = new Map((prev || []).map((t) => [t.chatId, t]));
                  for (const th of normalized)
                    map.set(th.chatId, { ...map.get(th.chatId), ...th });
                  return Array.from(map.values());
                });
              } catch {}
            } catch {}
          })();
        }
      } catch {}
    };
    es.addEventListener("message.created", onMessage as any);
    return () => {
      try {
        es.removeEventListener("message.created", onMessage as any);
        es.close();
      } catch {}
    };
  }, [activeChatId, uid]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showTherapyModal, setShowTherapyModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [therapies, setTherapies] = useState<any[] | null>(null);
  const [therapyForm, setTherapyForm] = useState<{
    name: string;
    description: string;
    durationMinutes: number;
    venueAddress?: string;
    price?: number;
    category?: string;
    status?: string;
    requirements?: string;
  }>({
    name: "",
    description: "",
    durationMinutes: 60,
    venueAddress: "",
    price: 0,
    category: "",
    status: "active",
    requirements: "",
  });
  const [editingTherapyId, setEditingTherapyId] = useState<string | null>(null);
  const [isTherapyViewOpen, setIsTherapyViewOpen] = useState(false);
  const [viewTherapy, setViewTherapy] = useState<any | null>(null);
  const [chatThreads, setChatThreads] = useState<any[] | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[] | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [adminChatId, setAdminChatId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "message" | "appointment" | "system";
      title: string;
      message?: string;
      priority?: "high" | "medium" | "low";
      read?: boolean;
      createdAt: number;
    }>
  >([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [typing, setTyping] = useState(false);
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  // Live appointments and patients derived from backend
  const [doctorAppointments, setDoctorAppointments] = useState<any[] | null>(
    null
  );
  const [patientsFromAppointments, setPatientsFromAppointments] = useState<
    any[] | null
  >(null);
  const [contactSearch, setContactSearch] = useState("");

  // Add Staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
  }>({ name: "", email: "", role: "therapist", isApproved: true });
  const [savingStaff, setSavingStaff] = useState(false);

  // Currency formatter for INR
  const formatINR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleMarkComplete = async (appointmentId: number | string) => {
    const token = (useAuthStore.getState().token as string) || "";
    const idStr = String(appointmentId);
    const isMongoId = /^[a-f\d]{24}$/i.test(idStr);
    if (!token || !isMongoId) {
      toast.info("Demo session updated locally (no backend ID)");
      return;
    }
    try {
      await updateAppointmentStatus(idStr, "completed", token);
      toast.success("Session marked complete");
    } catch (e) {
      toast.error("Failed to update session status");
    }
  };

  const handleMarkDelayed = async (appointmentId: number | string) => {
    const token = (useAuthStore.getState().token as string) || "";
    const idStr = String(appointmentId);
    const isMongoId = /^[a-f\d]{24}$/i.test(idStr);
    if (!token || !isMongoId) {
      toast.info("Demo session delayed locally (no backend ID)");
      return;
    }
    try {
      await updateAppointmentStatus(idStr, "delayed", token);
      toast.success("Session marked delayed");
    } catch (e) {
      toast.error("Failed to update session status");
    }
  };

  const handleSendMessage = (patientId: string) => {
    if (newMessage.trim()) {
      const token = (useAuthStore.getState().token as string) || "";
      if (selectedChatId && uid && token) {
        sendChatMessage(
          selectedChatId,
          { senderId: uid, text: newMessage },
          token
        )
          .then((resp) => {
            setChatMessages(resp.messages);
            setNewMessage("");
          })
          .catch(() => {
            // keep UI responsive even if backend unavailable
            setNewMessage("");
          });
      } else {
        setNewMessage("");
      }
    }
  };

  const filteredPatients = mockData.patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Load therapies from backend when available
  useEffect(() => {
    let cancelled = false;
    const token = useAuthStore.getState().token as any;
    (async () => {
      try {
        if (!token) return;
        const data = await getTherapies(token);
        if (!cancelled && Array.isArray(data)) {
          setTherapies(data);
        }
      } catch (e) {
        // keep using mock data if backend not available
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // When selecting a patient to chat, resolve or create a chat thread and load messages
  useEffect(() => {
    const token = (useAuthStore.getState().token as string) || "";
    if (!showChat || !selectedPatient || !uid || !token) return;
    setChatLoading(true);
    setSelectedChatId(null);
    setChatMessages(null);
    listMessageThreads(
      String((selectedPatient as any).id || (selectedPatient as any).uid),
      token
    )
      .then((threads) => {
        setChatThreads(threads);
        // find thread with this doctor
        const mine = threads.find((t: Record<string, unknown>) => t?.doctor?.uid === uid);
        if (mine?.chatId) {
          setSelectedChatId(mine.chatId);
          return listChatMessages(mine.chatId, token, uid).then((data) => {
            setChatMessages(data.messages);
          });
        }
      })
      .catch(() => {})
      .finally(() => setChatLoading(false));
  }, [showChat, selectedPatient, uid]);

  // Lightweight polling for chat messages when a chat is open
  useEffect(() => {
    const token = (useAuthStore.getState().token as string) || "";
    if (!selectedChatId || !token) return;
    const interval = setInterval(() => {
      listChatMessages(selectedChatId, token, uid || undefined)
        .then((d) => setChatMessages(d.messages))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedChatId, uid]);

  // SSE for realtime messages/unread/appointments
  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || "https://ayur-api.vercel.app";
    const es = new EventSource(`${apiBase}/api/events`);
    const lastMessageChatIdRef = { current: null as string | null };
    es.addEventListener("message.created", async (ev: MessageEvent) => {
      try {
        const data = JSON.parse((ev as any).data);
        const evChatId = data?.payload?.chatId;
        if (!evChatId) return;
        lastMessageChatIdRef.current = String(evChatId);
        if (evChatId === selectedChatId || evChatId === adminChatId) {
          const token = (useAuthStore.getState().token as string) || "";
          if (token) {
            const updated = await listChatMessages(
              evChatId,
              token,
              uid || undefined
            );
            setChatMessages(updated.messages || []);
          }
        } else {
          setNotifications(
            (prev) =>
              [
                {
                  id: `${Date.now()}-msg`,
                  type: "message" as const,
                  title:
                    (data?.payload?.message?.sender?.name as string) ||
                    "New message",
                  message: String(
                    (data?.payload?.message?.text as string) || "Message"
                  ),
                  priority: "low" as const,
                  read: false,
                  createdAt: Date.now(),
                },
                ...prev,
              ].slice(0, 50) as typeof prev
          );
          setUnreadByChat((prev) => ({
            ...prev,
            [evChatId]: (prev[evChatId] || 0) + 1,
          }));
        }
      } catch {}
    });
    es.addEventListener("appointment.updated", () => {
      setNotifications(
        (prev) =>
          [
            {
              id: `${Date.now()}-apt`,
              type: "appointment" as const,
              title: "Appointment updated",
              message: "Session status or notes changed",
              priority: "medium" as const,
              read: false,
              createdAt: Date.now(),
            },
            ...prev,
          ].slice(0, 50) as typeof prev
      );
      // Refresh doctor appointments list if present
      (async () => {
        try {
          const token = (useAuthStore.getState().token as string) || "";
          if (!token) return;
          const all = await getAllAppointments(token);
          const filtered = (all || []).filter(
            (a: Record<string, unknown>) => (a?.doctor?.email || "") === (email || "")
          );
          setDoctorAppointments(filtered);
          const map = new Map<string, any>();
          for (const a of filtered) {
            const p = a?.patient || {};
            const key = String(p?.email || p?._id || Math.random());
            if (!map.has(key))
              map.set(key, {
                id: key,
                name: p?.name || p?.displayName || p?.email || "Patient",
                email: p?.email || "",
                phone: p?.phone || "",
                status: "active",
                age: p?.age || undefined,
                conditions: [],
              });
          }
          setPatientsFromAppointments(Array.from(map.values()));
        } catch {}
      })();
    });
    es.addEventListener("appointment.created", (ev: MessageEvent) => {
      (async () => {
        try {
          const token = (useAuthStore.getState().token as string) || "";
          if (!token) return;
          // Notify doctor with patient name
          try {
            const data = JSON.parse((ev as any).data || "{}");
            const payload = data?.payload || {};
            const patientName =
              payload?.patient?.name ||
              payload?.patient?.displayName ||
              payload?.patient?.email ||
              "Patient";
            const therapyName = payload?.therapy?.name || "Therapy";
            setNotifications(
              (prev) =>
                [
                  {
                    id: `${Date.now()}-apt-created`,
                    type: "appointment" as const,
                    title: "New session booked",
                    message: `${patientName} booked ${therapyName}`,
                    priority: "high" as const,
                    read: false,
                    createdAt: Date.now(),
                  },
                  ...prev,
                ].slice(0, 50) as typeof prev
            );
          } catch {}
          const all = await getAllAppointments(token);
          const filtered = (all || []).filter(
            (a: Record<string, unknown>) => (a?.doctor?.email || "") === (email || "")
          );
          setDoctorAppointments(filtered);
          const map = new Map<string, any>();
          for (const a of filtered) {
            const p = a?.patient || {};
            const key = String(p?.email || p?._id || Math.random());
            if (!map.has(key))
              map.set(key, {
                id: key,
                name: p?.name || p?.displayName || p?.email || "Patient",
                email: p?.email || "",
                phone: p?.phone || "",
                status: "active",
                age: p?.age || undefined,
                conditions: [],
              });
          }
          setPatientsFromAppointments(Array.from(map.values()));
        } catch {}
      })();
    });
    return () => es.close();
  }, [selectedChatId, adminChatId, uid]);

  // Keep unread counter in sync with notifications list
  useEffect(() => {
    setUnreadCount((notifications || []).filter((n) => !n.read).length);
  }, [notifications]);

  // Initial load of doctor appointments
  useEffect(() => {
    (async () => {
      try {
        const token = (useAuthStore.getState().token as string) || "";
        if (!token) return;
        const all = await getAllAppointments(token);
        const filtered = (all || []).filter(
          (a: Record<string, unknown>) => (a?.doctor?.email || "") === (email || "")
        );
        setDoctorAppointments(filtered);
        const map = new Map<string, any>();
        for (const a of filtered) {
          const p = a?.patient || {};
          const key = String(p?.email || p?._id || Math.random());
          if (!map.has(key))
            map.set(key, {
              id: key,
              name: p?.name || p?.displayName || p?.email || "Patient",
              email: p?.email || "",
              phone: p?.phone || "",
              status: "active",
              age: p?.age || undefined,
              conditions: [],
            });
        }
        setPatientsFromAppointments(Array.from(map.values()));
      } catch {}
    })();
  }, [email]);

  function onComposerKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!composer.trim() && !attachmentUrl.trim()) return;
      if (!(selectedChatId || adminChatId) || !uid) return;
      const token = (useAuthStore.getState().token as string) || "";
      const chatId = selectedChatId || adminChatId!;
      sendChatMessage(
        chatId,
        {
          senderId: uid,
          text: composer.trim() || undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        },
        token
      )
        .then((resp) => {
          setChatMessages(resp.messages || []);
          setComposer("");
          setAttachmentUrl("");
        })
        .catch(() => setComposer(""));
    } else {
      // local typing indicator
      if (!typing) setTyping(true);
      setTimeout(() => setTyping(false), 1200);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome, Dr. {displayName || "Doctor"}!
                </h1>
                <p className="text-green-100">
                  Manage your patients and therapy sessions efficiently.
                </p>
              </div>
              <div className="flex space-x-2 items-center">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 relative"
                  onClick={() => setNotifOpen(true)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setShowTherapyModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Therapy
                </Button>
                {(role === "admin" || role === "doctor") && (
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setShowAddStaffModal(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Staff
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Today's Sessions
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.todayAppointments.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Active Patients
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.patients.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Stethoscope className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Therapies
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.therapies.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Unread Messages
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.messages.filter((m) => !m.isRead).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="therapies">Therapies</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Today's Appointments
                    </CardTitle>
                    <CardDescription>
                      Your scheduled therapy sessions for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.todayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {appointment.time}
                              </span>
                              <Badge
                                className={getStatusColor(appointment.status)}
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.patient}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.therapy} • {appointment.duration}
                            </p>
                            {appointment.notes && (
                              <p className="text-xs text-gray-400 mt-1">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === "upcoming" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleMarkComplete(appointment.id)
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleMarkDelayed(appointment.id)
                                  }
                                >
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Delay
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Recent Activities
                    </CardTitle>
                    <CardDescription>
                      Your recent actions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {activity.type === "completed" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : activity.type === "update" ? (
                              <TrendingUp className="h-5 w-5 text-blue-500" />
                            ) : activity.type === "delayed" ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Calendar className="h-5 w-5 text-purple-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.action}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Patient: {activity.patient}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.time}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-gray-400 mt-1">
                                {activity.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Important updates and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-3 p-4 border rounded-lg ${
                          !notification.isRead
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <Bell
                            className={`h-5 w-5 ${getPriorityColor(
                              notification.priority
                            )}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(
                                notification.priority
                              )}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab removed; Profile is now accessible from header user menu */}

            {/* Patients Tab */}
            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Patient Management
                      </CardTitle>
                      <CardDescription>
                        Manage your assigned patients and their progress
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search by name/email"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(patientsFromAppointments &&
                    patientsFromAppointments.length
                      ? patientsFromAppointments
                      : filteredPatients
                    ).map((patient: Record<string, unknown>) => (
                      <div
                        key={patient.id || patient.email}
                        className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">
                                {patient.name}
                              </h3>
                              <Badge className={getStatusColor(patient.status)}>
                                {patient.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {patient.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              {patient.phone}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  {patient.progress}% Progress
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-500">
                                  Last visit: {patient.lastVisit}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Stethoscope className="h-4 w-4 text-purple-500" />
                                <span className="text-sm text-gray-500">
                                  {patient.completedSessions}/
                                  {patient.totalSessions} sessions
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {patient.conditions.map(
                                (condition: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {condition}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewPatient(patient)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* View Patient Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Patient Details</DialogTitle>
                  <DialogDescription>
                    Quick view of patient information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {viewPatient ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {String(viewPatient.name || "U").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {viewPatient.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {viewPatient.email}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">Phone</div>
                          <div className="text-sm">
                            {viewPatient.phone || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <div className="text-sm">
                            {viewPatient.status || "—"}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-500">
                            Conditions
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {(viewPatient.conditions || []).map(
                              (c: string, i: number) => (
                                <Badge
                                  key={`cond-${i}`}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {c}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsViewOpen(false)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPatient(viewPatient);
                            setIsViewOpen(false);
                            setActiveTab("messages");
                          }}
                        >
                          Open Chat
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No patient selected.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Notes Dialog */}
            <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Session Notes</DialogTitle>
                  <DialogDescription>
                    These notes will be saved with this session.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Write notes, recommendations, prescriptions..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNotesOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveNotes}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Session Details Dialog */}
            <Dialog
              open={isSessionDetailsOpen}
              onOpenChange={setIsSessionDetailsOpen}
            >
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Session Details</DialogTitle>
                  <DialogDescription>Full session summary</DialogDescription>
                </DialogHeader>
                {detailsSession ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Patient</div>
                        <div className="font-medium">
                          {detailsSession.patient}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Therapy</div>
                        <div className="font-medium">
                          {detailsSession.therapy}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Time</div>
                        <div>
                          {detailsSession.time} • {detailsSession.duration}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div>{detailsSession.status}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Notes</div>
                        <div className="whitespace-pre-wrap">
                          {detailsSession.notes || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No session selected.
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Session Management
                  </CardTitle>
                  <CardDescription>
                    Manage therapy sessions and track progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(doctorAppointments && doctorAppointments.length
                      ? doctorAppointments
                      : mockData.todayAppointments
                    ).map((session: Record<string, unknown>) => (
                      <div
                        key={session._id || session.id}
                        className="flex items-center justify-between p-6 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <span className="font-semibold text-lg">
                              {session.startTime
                                ? new Date(
                                    session.startTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : session.time}
                            </span>
                            <Badge
                              className={getStatusColor(
                                session.status || session?.status
                              )}
                            >
                              {session.status || session?.status}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <h3 className="font-medium text-lg">
                              {session.patient?.name ||
                                session.patient ||
                                "Patient"}
                            </h3>
                            <p className="text-gray-600">
                              {session.therapy?.name ||
                                session.therapy ||
                                "Therapy"}{" "}
                              •{" "}
                              {session.therapy?.durationMinutes ||
                                session.duration ||
                                ""}
                            </p>
                            {(session.notes || session?.notes) && (
                              <p className="text-sm text-gray-500 mt-1">
                                {session.notes || session?.notes}
                              </p>
                            )}
                          </div>
                          {session.progress !== undefined && (
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center space-x-1">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {session.progress}% Complete
                                </span>
                              </div>
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${session.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {(session.status === "upcoming" ||
                            session.status === "scheduled") && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleMarkComplete(session._id || session.id)
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleMarkDelayed(session._id || session.id)
                                }
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Mark Delayed
                              </Button>
                              <div className="flex gap-2 pt-1">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => openAddNotes(session)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Add Notes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openSessionDetails(session)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </>
                          )}
                          {session.status === "in-progress" && (
                            <Button
                              size="sm"
                              onClick={() => setShowFeedbackModal(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Add Notes
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Therapies Tab */}
            <TabsContent value="therapies" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Stethoscope className="h-5 w-5 mr-2" />
                        Therapy Management
                      </CardTitle>
                      <CardDescription>
                        Manage available therapies and treatments
                      </CardDescription>
                    </div>
                    {/* Doctor and Admin can add therapies */}
                    {(role === "admin" || role === "doctor") && (
                      <Button
                        onClick={() => {
                          setEditingTherapyId(null);
                          setTherapyForm({
                            name: "",
                            description: "",
                            durationMinutes: 60,
                          });
                          setShowTherapyModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Therapy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(therapies || mockData.therapies).map((therapy: Record<string, unknown>) => (
                      <div
                        key={therapy._id || therapy.id}
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-lg">
                            {therapy.name}
                          </h3>
                          <Badge variant="outline">{therapy.category}</Badge>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {therapy.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-medium">
                              {therapy.durationMinutes || therapy.duration || 0}{" "}
                              min
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium">
                              {formatINR.format(Number(therapy.price || 0))}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status:</span>
                            <Badge
                              className={getStatusColor(
                                therapy.status || "active"
                              )}
                            >
                              {therapy.status || "active"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          <strong>Requirements:</strong>{" "}
                          {therapy.requirements || "—"}
                        </p>
                        <div className="flex space-x-2">
                          {(role === "admin" || role === "doctor") && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setEditingTherapyId(
                                    String(therapy._id || therapy.id)
                                  );
                                  setTherapyForm({
                                    name: therapy.name || "",
                                    description: therapy.description || "",
                                    durationMinutes:
                                      therapy.duration ||
                                      therapy.durationMinutes ||
                                      60,
                                    venueAddress: therapy.venueAddress || "",
                                    price: Number(therapy.price || 0),
                                    category: therapy.category || "",
                                    status: therapy.status || "active",
                                    requirements: therapy.requirements || "",
                                  });
                                  setShowTherapyModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const token =
                                    (useAuthStore.getState().token as any) ||
                                    "";
                                  if (!token || (!therapy._id && !therapy.id))
                                    return;
                                  try {
                                    await deleteTherapy(
                                      String(therapy._id || therapy.id),
                                      token
                                    );
                                    // refresh list
                                    const fresh = await getTherapies(token);
                                    setTherapies(
                                      Array.isArray(fresh) ? fresh : null
                                    );
                                  } catch {}
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setViewTherapy(therapy);
                              setIsTherapyViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Total Sessions
                        </p>
                        <p className="text-2xl font-bold">
                          {mockData.analytics.totalSessions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Completed
                        </p>
                        <p className="text-2xl font-bold">
                          {mockData.analytics.completedSessions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Delayed
                        </p>
                        <p className="text-2xl font-bold">
                          {mockData.analytics.delayedSessions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Satisfaction
                        </p>
                        <p className="text-2xl font-bold">
                          {mockData.analytics.patientSatisfaction}/5
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Therapies</CardTitle>
                    <CardDescription>
                      Most popular therapies by session count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.analytics.topTherapies.map((therapy, idx) => (
                        <div
                          key={`${therapy.name}-${idx}`}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium">{therapy.name}</p>
                              <p className="text-sm text-gray-500">
                                {therapy.count} sessions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatINR.format(therapy.revenue)}
                            </p>
                            <p className="text-sm text-gray-500">revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>
                      Revenue breakdown for this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600">
                        {formatINR.format(mockData.analytics.monthlyRevenue)}
                      </p>
                      <p className="text-gray-500 mt-2">Total Revenue</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Session Duration:</span>
                          <span className="font-medium">
                            {mockData.analytics.averageSessionDuration} min
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate:</span>
                          <span className="font-medium">
                            {Math.round(
                              (mockData.analytics.completedSessions /
                                mockData.analytics.totalSessions) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" /> Contacts
                    </CardTitle>
                    <CardDescription>Patients and Admin chat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search by name/email"
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const token =
                            (useAuthStore.getState().token as any) || "";
                          if (!uid || !token) return;
                          try {
                            const t = await getDoctorAdminThread(uid, token);
                            setAdminChatId(t.chatId);
                            setSelectedChatId(null);
                            const data = await listChatMessages(
                              t.chatId,
                              token,
                              uid
                            );
                            setChatMessages(data.messages || []);
                            setActiveChatId(t.chatId);
                            setUnreadCount(0);
                            setUnreadByChat((prev) => ({
                              ...prev,
                              [t.chatId]: 0,
                            }));
                          } catch {}
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" /> Admin Room
                      </Button>
                      <div className="border rounded-md divide-y max-h-[60vh] overflow-auto">
                        {doctorThreads.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">
                            No chats yet.
                          </div>
                        ) : (
                          doctorThreads
                            .filter((t) => {
                              const q = contactSearch.trim().toLowerCase();
                              if (!q) return true;
                              const name = String(
                                t.patient?.name || t.patient?.displayName || ""
                              ).toLowerCase();
                              const email = String(
                                t.patient?.email || ""
                              ).toLowerCase();
                              const uidStr = String(
                                t.patient?.uid || ""
                              ).toLowerCase();
                              return (
                                name.includes(q) ||
                                email.includes(q) ||
                                uidStr.includes(q)
                              );
                            })
                            .map((t) => (
                              <button
                                key={
                                  t.chatId ||
                                  String(
                                    t.patient?.uid ||
                                      t.patient?.id ||
                                      t.patient?.email ||
                                      "contact"
                                  )
                                }
                                className="w-full text-left p-3 hover:bg-accent/50"
                                onClick={async () => {
                                  const token =
                                    (useAuthStore.getState().token as any) ||
                                    "";
                                  if (!token) return;
                                  setAdminChatId(null);
                                  try {
                                    let chatId: string | null =
                                      t.chatId || null;
                                    // If we don't have a chat yet, try to resolve now
                                    if (!chatId) {
                                      const ptsThreads =
                                        await listMessageThreads(
                                          String(
                                            t.patient?.uid || t.patient?.id
                                          ),
                                          token
                                        );
                                      const found = (ptsThreads || []).find(
                                        (th: Record<string, unknown>) =>
                                          String(
                                            th?.doctor?.uid ||
                                              th?.doctor?.id ||
                                              th?.doctor?._id
                                          ) === String(uid)
                                      );
                                      chatId = found?.chatId
                                        ? String(found.chatId)
                                        : null;
                                      // Merge resolved chatId back into list and cache
                                      if (chatId) {
                                        const resolved = chatId as string;
                                        setDoctorThreads(
                                          (prev) =>
                                            (prev || []).map((x) =>
                                              (x.chatId ||
                                                x.patient?.uid ||
                                                x.patient?.id) ===
                                              (t.chatId ||
                                                t.patient?.uid ||
                                                t.patient?.id)
                                                ? { ...x, chatId: resolved }
                                                : x
                                            ) as Array<{
                                              chatId: string;
                                              patient: Record<string, unknown>;
                                            }>
                                        );
                                      }
                                    }
                                    if (!chatId || chatId === "") {
                                      toast.info(
                                        "No existing thread yet. Ask patient to send the first message."
                                      );
                                      return;
                                    }
                                    const resolvedId = chatId as string;
                                    setSelectedChatId(resolvedId);
                                    const data = await listChatMessages(
                                      resolvedId,
                                      token,
                                      uid || undefined
                                    );
                                    setChatMessages(data.messages || []);
                                    setActiveChatId(resolvedId);
                                    setUnreadByChat((prev) => ({
                                      ...prev,
                                      [resolvedId]: 0,
                                    }));
                                  } catch {}
                                }}
                              >
                                <div className="font-medium">
                                  {t.patient?.name ||
                                    t.patient?.email ||
                                    "Patient"}
                                  {t.patient?.role ? (
                                    <span className="ml-2 text-xs text-gray-500 capitalize">
                                      ({t.patient.role})
                                    </span>
                                  ) : null}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {t.patient?.email || t.patient?.uid || ""}
                                </div>
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Chat{" "}
                      {typing && (
                        <span className="text-xs text-gray-500">• typing…</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col h-[60vh]">
                      <div className="flex-1 overflow-auto space-y-2 border rounded-md p-3">
                        {!(activeChatId || selectedChatId || adminChatId) ? (
                          <div className="text-sm text-gray-500">
                            Select a contact to start chatting.
                          </div>
                        ) : (chatMessages || []).length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No messages yet.
                          </div>
                        ) : (
                          (chatMessages || []).map((m: Record<string, unknown>, i: number) => (
                            <div
                              key={m?._id || m?.id || m?.createdAt || i}
                              className="p-2 border rounded-md"
                            >
                              <div className="text-xs text-gray-500">
                                {m?.sender?.name || "User"}
                              </div>
                              <div className="text-sm whitespace-pre-wrap break-words">
                                {m?.text}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-3 flex gap-2 items-end">
                        <Textarea
                          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                          value={composer}
                          onChange={(e) => setComposer(e.target.value)}
                          onKeyDown={onComposerKeyDown}
                          rows={2}
                        />
                        <Input
                          placeholder="Attachment URL (optional)"
                          value={attachmentUrl}
                          onChange={(e) => setAttachmentUrl(e.target.value)}
                        />
                        <Button
                          onClick={() => {
                            if (!composer.trim() && !attachmentUrl.trim())
                              return;
                            const token =
                              (useAuthStore.getState().token as any) || "";
                            const chatId = selectedChatId || adminChatId;
                            if (!chatId || !uid || !token) return;
                            sendChatMessage(
                              chatId,
                              {
                                senderId: uid,
                                text: composer.trim() || undefined,
                                attachmentUrl:
                                  attachmentUrl.trim() || undefined,
                              },
                              token
                            )
                              .then((resp) => {
                                setChatMessages(resp.messages || []);
                                setComposer("");
                                setAttachmentUrl("");
                              })
                              .catch(() => setComposer(""));
                          }}
                          disabled={!composer.trim() && !attachmentUrl.trim()}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Notifications Dialog */}
          <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Real-time updates for your sessions and messages
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      )
                    }
                  >
                    Mark all read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("messages")}
                  >
                    Open Messages
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("sessions")}
                  >
                    Open Sessions
                  </Button>
                </div>
                <div className="max-h-80 overflow-auto space-y-2">
                  {(notifications || []).length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border rounded-md ${
                          !n.read ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{n.title}</div>
                          <Badge variant="outline">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </Badge>
                        </div>
                        {n.message && (
                          <div className="text-xs text-gray-600 mt-1">
                            {n.message}
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((x) =>
                                  x.id === n.id ? { ...x, read: true } : x
                                )
                              )
                            }
                          >
                            Mark read
                          </Button>
                          {n.type === "message" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Optional deep-link: n may include chatId
                                if ((n as any).chatId) {
                                  setSelectedChatId((n as any).chatId as any);
                                  setActiveChatId((n as any).chatId as any);
                                }
                                setActiveTab("messages");
                                setNotifOpen(false);
                              }}
                            >
                              View chat
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveTab("sessions");
                                setNotifOpen(false);
                              }}
                            >
                              View session
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create/Edit Therapy Modal */}
          <Dialog open={showTherapyModal} onOpenChange={setShowTherapyModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTherapyId ? "Edit Therapy" : "Add Therapy"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <Input
                    value={therapyForm.name}
                    onChange={(e) =>
                      setTherapyForm({ ...therapyForm, name: e.target.value })
                    }
                    placeholder="Therapy name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Description</label>
                  <Textarea
                    value={therapyForm.description}
                    onChange={(e) =>
                      setTherapyForm({
                        ...therapyForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Short description"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Therapy Venue Address
                  </label>
                  <Textarea
                    value={therapyForm.venueAddress || ""}
                    onChange={(e) =>
                      setTherapyForm({
                        ...therapyForm,
                        venueAddress: e.target.value,
                      })
                    }
                    placeholder="Clinic/venue address for this therapy"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={therapyForm.durationMinutes}
                    onChange={(e) =>
                      setTherapyForm({
                        ...therapyForm,
                        durationMinutes: parseInt(e.target.value || "0"),
                      })
                    }
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Price (INR)</label>
                  <Input
                    type="number"
                    value={Number(therapyForm.price || 0)}
                    onChange={(e) =>
                      setTherapyForm({
                        ...therapyForm,
                        price: Number(e.target.value || 0),
                      })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <Input
                    value={therapyForm.category || ""}
                    onChange={(e) =>
                      setTherapyForm({
                        ...therapyForm,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g. Massage, Detox"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <Select
                    value={therapyForm.status || "active"}
                    onValueChange={(v) =>
                      setTherapyForm({ ...therapyForm, status: v as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Requirements</label>
                  <Textarea
                    value={therapyForm.requirements || ""}
                    onChange={(e) =>
                      setTherapyForm({
                        ...therapyForm,
                        requirements: e.target.value,
                      })
                    }
                    placeholder="Any prerequisites or items to bring"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTherapyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      const token =
                        (useAuthStore.getState().token as any) || "";
                      if (
                        !token ||
                        !therapyForm.name ||
                        !therapyForm.durationMinutes
                      )
                        return;
                      try {
                        if (editingTherapyId) {
                          await updateTherapy(
                            editingTherapyId,
                            therapyForm,
                            token
                          );
                        } else {
                          await createTherapy(therapyForm, token);
                        }
                        const fresh = await getTherapies(token);
                        setTherapies(Array.isArray(fresh) ? fresh : null);
                        setShowTherapyModal(false);
                        setEditingTherapyId(null);
                        setTherapyForm({
                          name: "",
                          description: "",
                          durationMinutes: 60,
                          venueAddress: "",
                          price: 0,
                          category: "",
                          status: "active",
                          requirements: "",
                        });
                      } catch {}
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Therapy Details Dialog */}
          <Dialog open={isTherapyViewOpen} onOpenChange={setIsTherapyViewOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{viewTherapy?.name || "Therapy"}</DialogTitle>
                <DialogDescription>
                  Detailed information for this therapy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Description:</span>{" "}
                  {viewTherapy?.description || "—"}
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>{" "}
                  {viewTherapy?.durationMinutes || viewTherapy?.duration || 0}{" "}
                  min
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>{" "}
                  {formatINR.format(Number(viewTherapy?.price || 0))}
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>{" "}
                  {viewTherapy?.category || "—"}
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <Badge
                    className={getStatusColor(viewTherapy?.status || "active")}
                  >
                    {viewTherapy?.status || "active"}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Requirements:</span>{" "}
                  {viewTherapy?.requirements || "—"}
                </div>
                {viewTherapy?.venueAddress ? (
                  <div>
                    <span className="text-gray-500">Venue:</span>{" "}
                    {viewTherapy?.venueAddress}
                  </div>
                ) : null}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsTherapyViewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add New Staff Modal */}
          <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
                <DialogDescription>
                  Create a new staff member account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Full name</label>
                  <Input
                    value={staffForm.name}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, name: e.target.value })
                    }
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <Input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, email: e.target.value })
                    }
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <Select
                    value={staffForm.role}
                    onValueChange={(v) =>
                      setStaffForm({ ...staffForm, role: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddStaffModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      savingStaff || !staffForm.email || !staffForm.role
                    }
                    onClick={async () => {
                      const token =
                        (useAuthStore.getState().token as any) || "";
                      if (!token) {
                        toast.error("You are not authenticated");
                        return;
                      }
                      setSavingStaff(true);
                      try {
                        await createUserAdmin(
                          {
                            name: staffForm.name || undefined,
                            email: staffForm.email,
                            role: staffForm.role,
                            isApproved: staffForm.isApproved,
                          },
                          token
                        );
                        toast.success("Staff member created");
                        setShowAddStaffModal(false);
                        setStaffForm({
                          name: "",
                          email: "",
                          role: "therapist",
                          isApproved: true,
                        });
                      } catch (e: unknown) {
                        toast.error(e?.message || "Failed to create staff");
                      } finally {
                        setSavingStaff(false);
                      }
                    }}
                  >
                    {savingStaff ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Chat Modal */}
          <Dialog open={showChat} onOpenChange={setShowChat}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Messages</DialogTitle>
                <DialogDescription>
                  Chat with patients or admins
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Admin Chat Shortcut */}
                {role === "doctor" && (
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="text-sm text-gray-700">
                      Chat with Admins (common room)
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const token =
                          (useAuthStore.getState().token as any) || "";
                        if (!uid || !token) return;
                        try {
                          const t = await getDoctorAdminThread(uid, token);
                          setAdminChatId(t.chatId);
                          const data = await listChatMessages(
                            t.chatId,
                            token,
                            uid
                          );
                          setChatMessages(data.messages);
                        } catch {}
                      }}
                    >
                      Open Admin Chat
                    </Button>
                  </div>
                )}
                {/* Threads summary */}
                {selectedPatient && (
                  <div className="text-sm text-gray-600">
                    Chatting with {selectedPatient.name}
                  </div>
                )}
                {chatLoading && (
                  <div className="text-sm text-gray-500">Loading chat…</div>
                )}
                {!chatLoading && (selectedChatId || adminChatId) && (
                  <div className="max-h-80 overflow-auto space-y-2">
                    {(chatMessages || []).map((m: Record<string, unknown>, i: number) => (
                      <div
                        key={m?._id || m?.id || m?.createdAt || i}
                        className="p-3 border rounded-md"
                      >
                        <div className="text-xs text-gray-500">
                          {m?.sender?.name || "User"}
                        </div>
                        <div className="text-sm">{m?.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button onClick={() => handleSendMessage(String(uid || ""))}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
