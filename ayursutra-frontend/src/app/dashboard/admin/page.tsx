"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState, Suspense } from "react";
import {
  getDoctors,
  approveUser,
  getDoctorAdminThread,
  listChatMessages,
  sendChatMessage,
} from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  User,
  Users,
  Calendar,
  BarChart3,
  Settings,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity,
  Shield,
  Clock,
  Bell,
  MessageSquare,
  Grid3X3,
  List,
  Filter,
  Home,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
} from "@/lib/api";
import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getTherapies,
  getMemberSessions,
} from "@/lib/api";
import { toast, Toaster } from "sonner";

const SUPER_ADMIN_EMAIL = "ranvijaykr.in@gmail.com";
const SUPER_ADMIN_NAME = "Ranvijay Kumar";

// Mock data for demonstration
const mockData = {
  staff: [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Therapist",
      status: "active",
      patients: 12,
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      role: "Therapist",
      status: "active",
      patients: 8,
      lastActive: "1 hour ago",
    },
    {
      id: 3,
      name: "Dr. Emily Davis",
      role: "Therapist",
      status: "inactive",
      patients: 5,
      lastActive: "1 day ago",
    },
  ],
  revenue: [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 48000 },
    { month: "Apr", amount: 61000 },
  ],
  recentActivities: [
    {
      id: 1,
      action: "New staff member added",
      user: "Dr. John Smith",
      time: "2 hours ago",
      type: "staff",
    },
    {
      id: 2,
      action: "Monthly report generated",
      user: "System",
      time: "1 day ago",
      type: "report",
    },
    {
      id: 3,
      action: "Schedule updated",
      user: "Dr. Sarah Johnson",
      time: "2 days ago",
      type: "schedule",
    },
  ],
  systemStats: {
    totalPatients: 156,
    activeTherapists: 8,
    monthlyRevenue: 61000,
    utilizationRate: 85,
  },
};

function AdminDashboardContent() {
  const { uid, role, displayName, email } = useAuthStore();
  const token = useAuthStore((s) => s.token) as any;
  const [activeTab, setActiveTab] = useState("home");
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvedDoctors, setApprovedDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [adminChatId, setAdminChatId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const searchParams = useSearchParams();
  const [sseConnected, setSseConnected] = useState(false);
  const [recentFeed, setRecentFeed] = useState<
    Array<{
      id: string;
      type: "approval" | "message" | "appointment";
      title: string;
      subtitle?: string;
      at: number;
    }>
  >([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  // Patients tab state
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState<{
    name: string;
    email: string;
    role: string;
    isApproved?: boolean;
  }>({
    name: "",
    email: "",
    role: "patient",
  });
  const [roleFilter, setRoleFilter] = useState<
    "all" | "patient" | "doctor" | "admin"
  >("all");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberSaving, setMemberSaving] = useState(false);
  // Session history dialog state
  const [sessionHistoryOpen, setSessionHistoryOpen] = useState(false);
  const [selectedMemberSessions, setSelectedMemberSessions] = useState<any[]>([]);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState<any>(null);
  const [memberSessionsLoading, setMemberSessionsLoading] = useState(false);
  
  // Activity Feed and Quick Actions State
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [isActivityLive, setIsActivityLive] = useState(true);
  const [quickActionsSettings, setQuickActionsSettings] = useState({
    showAddMember: true,
    showSchedule: true,
    showApprove: true,
    showReports: true,
    customActions: []
  });
  const [quickActionsDialogOpen, setQuickActionsDialogOpen] = useState(false);
  const [quickAlertsDialogOpen, setQuickAlertsDialogOpen] = useState(false);
  
  // Sessions tab state
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    patient: "",
    doctor: "",
    therapy: "",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [therapiesList, setTherapiesList] = useState<any[]>([]);
  
  // Session filtering state
  const [sessionDoctorFilter, setSessionDoctorFilter] = useState<string>("");
  const [sessionPatientFilter, setSessionPatientFilter] = useState<string>("");
  const [sessionDateFilter, setSessionDateFilter] = useState<string>("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("all");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");

  // Session action confirm modal (complete/delay)
  const [sessionActionOpen, setSessionActionOpen] = useState(false);
  const [sessionActionType, setSessionActionType] = useState<
    "complete" | "delay" | null
  >(null);
  const [sessionActionNotes, setSessionActionNotes] = useState("");
  const [sessionActionTargetId, setSessionActionTargetId] =
    useState<string>("");
  const [sessionActionSubmitting, setSessionActionSubmitting] = useState(false);

  async function submitSessionAction() {
    if (!token || !sessionActionType || !sessionActionTargetId) return;
    try {
      setSessionActionSubmitting(true);
      // 1) update notes if provided
      if (sessionActionNotes.trim()) {
        await updateAppointment(
          String(sessionActionTargetId),
          { notes: sessionActionNotes.trim() },
          token
        );
      }
      // 2) update status (completed or in_progress)
      const status =
        sessionActionType === "complete" ? "completed" : "in_progress";
      await updateAppointmentStatus(
        String(sessionActionTargetId),
        status,
        token
      );
      toast.success(
        sessionActionType === "complete"
          ? "Session marked as completed"
          : "Session marked as delayed (in progress)",
        {
          description: sessionActionType === "complete" 
            ? "The therapy session has been successfully completed and recorded."
            : "The session status has been updated to delayed/in progress.",
          icon: sessionActionType === "complete" ? "✅" : "⏳",
        }
      );
      setSessionActionOpen(false);
      setSessionActionNotes("");
      setSessionActionType(null);
      setSessionActionTargetId("");
      await loadSessions();
    } catch (e) {
      toast.error("Failed to update session", {
        description: "There was an error updating the session status. Please try again.",
        icon: "❌",
      });
    } finally {
      setSessionActionSubmitting(false);
    }
  }

  async function loadPending() {
    if (!token) return;
    setLoading(true);
    try {
      const docs = await getDoctors(token);
      const pending = (docs || []).filter(
        (d: Record<string, unknown>) =>
          d.role === "doctor" && d.isApproved === false
      );
      setPendingDoctors(pending);
      const approved = (docs || []).filter(
        (d: Record<string, unknown>) =>
          d.role === "doctor" && d.isApproved !== false
      );
      setApprovedDoctors(approved);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Initialize activity feed and start real-time generation
  useEffect(() => {
    // Generate initial activities
    const initialActivities = Array.from({ length: 3 }, () => generateActivity());
    setActivityFeed(initialActivities);

    // Set up interval for real-time activity generation
    const interval = setInterval(() => {
      addActivity();
    }, 8000); // Add new activity every 8 seconds

    return () => clearInterval(interval);
  }, [isActivityLive]);

  // Load sessions when component mounts
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Open notifications drawer when ?notifications=1 is present
  useEffect(() => {
    const q = searchParams?.get("notifications");
    if (q) setNotifOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function loadPatients() {
    if (!token) return;
    setPatientsLoading(true);
    try {
      // Load all users without search query - we'll filter client-side
      const list = await listUsers(
        token,
        roleFilter === "all" ? undefined : roleFilter
      );
      const arr = Array.isArray(list) ? list : [];
      // Deduplicate by uid/_id and normalize fields for display
      const seen = new Map<string, any>();
      for (const u of arr) {
        const key = String(u.uid || u._id || u.id || u.email || Math.random());
        if (seen.has(key)) continue;
        const normalized = {
          ...u,
          name:
            u.name ||
            u.displayName ||
            (u.role === "admin" && u.email === SUPER_ADMIN_EMAIL
              ? SUPER_ADMIN_NAME
              : "") ||
            "",
          email: u.email || "",
          role: u.role || "patient",
          uid: u.uid || u.id || u._id || "",
        };
        seen.set(key, normalized);
      }
      const allPatients = Array.from(seen.values());
      setPatients(allPatients);
      // Apply client-side filtering
      applyPatientFilters(allPatients);
    } catch (e) {
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, roleFilter]);

  // Initialize filtered patients when patients change
  useEffect(() => {
    setFilteredPatients(patients);
  }, [patients]);

  // Client-side filtering function
  function applyPatientFilters(patientsData: any[] = patients) {
    let filtered = [...patientsData];

    // Filter by search query (name, email, or title)
    if (patientQuery.trim()) {
      const query = patientQuery.trim().toLowerCase();
      filtered = filtered.filter((patient) => {
        const name = String(patient.name || "").toLowerCase();
        const email = String(patient.email || "").toLowerCase();
        const displayName = String(patient.displayName || "").toLowerCase();
        const role = String(patient.role || "").toLowerCase();
        
        // Create searchable text with titles
        const searchableText = [
          name,
          email,
          displayName,
          role === "doctor" ? `dr. ${name}` : name,
          role === "admin" ? `admin ${name}` : name,
          role === "patient" ? `patient ${name}` : name,
          role === "doctor" ? "doctor" : "",
          role === "admin" ? "admin" : "",
          role === "patient" ? "patient" : "",
        ].join(" ");
        
        return searchableText.includes(query);
      });
    }

    setFilteredPatients(filtered);
  }

  // Debounced query search - apply filters when query changes
  useEffect(() => {
    const handle = setTimeout(() => {
      applyPatientFilters();
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientQuery]);

  // Function to load member sessions
  async function loadMemberSessions(member: any) {
    if (!token) return;
    setMemberSessionsLoading(true);
    setSelectedMemberInfo(member);
    try {
      const memberId = String(member.uid || member._id || member.id);
      const memberSessions = await getMemberSessions(memberId, token);
      setSelectedMemberSessions(memberSessions);
      setSessionHistoryOpen(true);
    } catch (error) {
      console.error("Error loading member sessions:", error);
      setSelectedMemberSessions([]);
    } finally {
      setMemberSessionsLoading(false);
    }
  }

  // Activity Feed Functions
  function generateActivity() {
    const activities = [
      {
        id: Date.now() + Math.random(),
        type: "approval",
        title: "New doctor registration",
        subtitle: "Dr. " + ["Smith", "Johnson", "Williams", "Brown", "Davis"][Math.floor(Math.random() * 5)] + " registered",
        at: new Date().toISOString(),
        icon: Shield,
        color: "from-green-500 to-emerald-600"
      },
      {
        id: Date.now() + Math.random(),
        type: "message",
        title: "New patient message",
        subtitle: "Patient inquiry about therapy session",
        at: new Date().toISOString(),
        icon: MessageSquare,
        color: "from-blue-500 to-cyan-600"
      },
      {
        id: Date.now() + Math.random(),
        type: "appointment",
        title: "Session completed",
        subtitle: "Therapy session with Dr. " + ["Smith", "Johnson", "Williams"][Math.floor(Math.random() * 3)],
        at: new Date().toISOString(),
        icon: Calendar,
        color: "from-purple-500 to-pink-600"
      },
      {
        id: Date.now() + Math.random(),
        type: "system",
        title: "System update",
        subtitle: "Dashboard performance optimized",
        at: new Date().toISOString(),
        icon: Zap,
        color: "from-orange-500 to-red-600"
      },
      {
        id: Date.now() + Math.random(),
        type: "alert",
        title: "Delayed session",
        subtitle: "Session running 15 minutes late",
        at: new Date().toISOString(),
        icon: AlertTriangle,
        color: "from-yellow-500 to-orange-600"
      }
    ];
    
    return activities[Math.floor(Math.random() * activities.length)];
  }

  function addActivity() {
    if (!isActivityLive) return;
    const newActivity = generateActivity();
    setActivityFeed(prev => [newActivity, ...prev].slice(0, 10)); // Keep last 10 activities
  }

  // Quick Actions Functions
  function toggleQuickAction(action: string) {
    setQuickActionsSettings(prev => ({
      ...prev,
      [action]: !prev[action as keyof typeof prev]
    }));
  }

  function resetQuickActions() {
    setQuickActionsSettings({
      showAddMember: true,
      showSchedule: true,
      showApprove: true,
      showReports: true,
      customActions: []
    });
  }

  async function loadSessions() {
    if (!token) return;
    setSessionsLoading(true);
    try {
      const [apps, docs, ths] = await Promise.all([
        getAllAppointments(token),
        getDoctors(token),
        getTherapies(token),
      ]);
      const sessionsData = Array.isArray(apps) ? apps : [];
      setSessions(sessionsData);
      setDoctorsList(Array.isArray(docs) ? docs : []);
      setTherapiesList(Array.isArray(ths) ? ths : []);
      // Apply current filters
      applySessionFilters(sessionsData);
    } catch {
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }

  // Function to apply session filters
  function applySessionFilters(sessionsData: any[] = sessions) {
    let filtered = [...sessionsData];

    // Filter by doctor
    if (sessionDoctorFilter) {
      filtered = filtered.filter((session) => {
        const doctorName = formatEntityForDisplay(session.doctor) || "";
        return doctorName.toLowerCase().includes(sessionDoctorFilter.toLowerCase());
      });
    }

    // Filter by patient
    if (sessionPatientFilter) {
      filtered = filtered.filter((session) => {
        const patientName = formatEntityForDisplay(session.patient) || "";
        return patientName.toLowerCase().includes(sessionPatientFilter.toLowerCase());
      });
    }

    // Filter by date
    if (sessionDateFilter) {
      const filterDate = new Date(sessionDateFilter);
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return (
          sessionDate.getDate() === filterDate.getDate() &&
          sessionDate.getMonth() === filterDate.getMonth() &&
          sessionDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    // Filter by status
    if (sessionStatusFilter !== "all") {
      filtered = filtered.filter((session) => {
        return session.status === sessionStatusFilter;
      });
    }

    setFilteredSessions(filtered);
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Apply filters when filter values change
  useEffect(() => {
    applySessionFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDoctorFilter, sessionPatientFilter, sessionDateFilter, sessionStatusFilter]);

  function formatEntityForDisplay(entity: any): string {
    if (!entity) return "Unknown";
    if (typeof entity === "string") return entity;
    if (typeof entity === "number") return String(entity);
    return (
      entity.name ||
      entity.displayName ||
      entity.email ||
      entity.uid ||
      entity._id ||
      entity.id ||
      "Unknown"
    );
  }

  // Realtime: subscribe to SSE events for approvals, messages, appointments
  useEffect(() => {
    if (!token) return;
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || "https://ayur-api.vercel.app";
    const es = new EventSource(`${apiBase}/api/events`);
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);

    es.addEventListener("user.approved", async () => {
      toast.success("New doctor approved!", {
        description: "The doctor has been successfully approved and can now access the platform.",
        icon: "👨‍⚕️",
      });
      await loadPending();
      await loadPatients();
      setRecentFeed((prev) =>
        [
          {
            id: `${Date.now()}-approval`,
            type: "approval" as const,
            title: "Doctor approved",
            subtitle: "Access granted",
            at: Date.now(),
          },
          ...prev,
        ].slice(0, 20)
      );
      await computeReports();
    });

    es.addEventListener("message.created", async (ev: MessageEvent) => {
      try {
        const data = JSON.parse((ev as any).data);
        const evChatId = data?.payload?.chatId;
        if (data?.payload?.chatId && data?.payload?.message) {
          // Potentially show a toast for new message
          toast.info(`New message received`, {
            description: `You have a new message in chat ${data.payload.chatId}`,
            icon: "💬",
          });
          setRecentFeed((prev) =>
            [
              {
                id: `${data.payload.chatId}-${
                  data.payload.message.createdAt || Date.now()
                }`,
                type: "message" as const,
                title: data.payload.message.sender?.name || "New message",
                subtitle: String(data.payload.message.text || "Message"),
                at: Date.now(),
              },
              ...prev,
            ].slice(0, 20)
          );
          // Increment unread if not viewing Messages tab
          if (activeTab !== "messages") {
            setUnreadMessagesCount((c) => c + 1);
          }
        }
      } catch {}
    });

    es.addEventListener("appointment.created", async () => {
      toast.success("New appointment created!", {
        description: "A new therapy session has been successfully scheduled.",
        icon: "📅",
      });
      await loadSessions();
      setRecentFeed((prev) =>
        [
          {
            id: `${Date.now()}-apt-created`,
            type: "appointment" as const,
            title: "Appointment created",
            subtitle: "Schedule updated",
            at: Date.now(),
          },
          ...prev,
        ].slice(0, 20)
      );
      await computeReports();
    });

    es.addEventListener("appointment.updated", async () => {
      toast.info("Appointment updated!", {
        description: "The therapy session details have been successfully modified.",
        icon: "✏️",
      });
      await loadSessions();
      setRecentFeed((prev) =>
        [
          {
            id: `${Date.now()}-apt-updated`,
            type: "appointment" as const,
            title: "Appointment updated",
            subtitle: "Status or notes changed",
            at: Date.now(),
          },
          ...prev,
        ].slice(0, 20)
      );
      await computeReports();
    });

    return () => {
      es.close();
    };
  }, [token, activeTab]);

  // Reset unread when switching to Messages tab
  useEffect(() => {
    if (activeTab === "messages") setUnreadMessagesCount(0);
  }, [activeTab]);

  // Roles & Authorization State
  const [admins, setAdmins] = useState<any[]>([]);
  const [nonAdmins, setNonAdmins] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState<string>("");
  const [promoteSaving, setPromoteSaving] = useState(false);
  const [adminLabels, setAdminLabels] = useState<
    Record<string, "super" | "manager" | "support">
  >({});
  const [permissionsConfig, setPermissionsConfig] = useState<
    Record<
      "super" | "manager" | "support",
      Record<
        | "members"
        | "approvals"
        | "sessions"
        | "messages"
        | "reports"
        | "therapies",
        { view: boolean; manage: boolean }
      >
    >
  >({
    super: {
      members: { view: true, manage: true },
      approvals: { view: true, manage: true },
      sessions: { view: true, manage: true },
      messages: { view: true, manage: true },
      reports: { view: true, manage: true },
      therapies: { view: true, manage: true },
    },
    manager: {
      members: { view: true, manage: true },
      approvals: { view: true, manage: true },
      sessions: { view: true, manage: true },
      messages: { view: true, manage: true },
      reports: { view: true, manage: false },
      therapies: { view: true, manage: true },
    },
    support: {
      members: { view: true, manage: false },
      approvals: { view: true, manage: false },
      sessions: { view: true, manage: false },
      messages: { view: true, manage: true },
      reports: { view: false, manage: false },
      therapies: { view: true, manage: false },
    },
  });

  function loadRolesLocal() {
    try {
      const labelsRaw = localStorage.getItem("adminRoleLabels");
      if (labelsRaw) setAdminLabels(JSON.parse(labelsRaw));
      const permRaw = localStorage.getItem("rbacPermissions");
      if (permRaw) setPermissionsConfig(JSON.parse(permRaw));
    } catch {}
  }

  async function loadRolesData() {
    if (!token) return;
    setRolesLoading(true);
    try {
      const [adminUsers, allUsers] = await Promise.all([
        listUsers(token, "admin"),
        listUsers(token),
      ]);
      setAdmins(adminUsers || []);
      setNonAdmins(
        (allUsers || []).filter(
          (u: Record<string, unknown>) => u.role !== "admin"
        )
      );
    } catch (e) {
      toast.error("Failed to load role data", {
        description: "There was an error loading the role management data. Please refresh the page.",
        icon: "❌",
      });
    } finally {
      setRolesLoading(false);
    }
  }

  function saveAdminLabels(
    next: Record<string, "super" | "manager" | "support">
  ) {
    setAdminLabels(next);
    try {
      localStorage.setItem("adminRoleLabels", JSON.stringify(next));
      toast.success("Admin roles updated", {
        description: "The role labels have been successfully saved and applied.",
        icon: "🔧",
      });
    } catch {}
  }

  function savePermissionsConfig(next: typeof permissionsConfig) {
    setPermissionsConfig(next);
    try {
      localStorage.setItem("rbacPermissions", JSON.stringify(next));
      toast.success("Permissions saved", {
        description: "The permission settings have been successfully updated.",
        icon: "🔐",
      });
    } catch {}
  }

  async function handlePromoteToAdmin() {
    if (!token || !promoteUserId) return;
    try {
      setPromoteSaving(true);
      await updateUserAdmin(
        promoteUserId,
        { role: "admin", isApproved: true },
        token
      );
      setPromoteUserId("");
      await loadRolesData();
      toast.success("User promoted to admin", {
        description: "The user has been successfully promoted to admin role.",
        icon: "⬆️",
      });
    } catch (error: any) {
      console.error("Promote user error:", error);
      if (error.message?.includes("403")) {
        toast.error("Permission denied", {
          description: "You don't have permission to promote users to admin. Only super admins can promote users.",
          icon: "🚫",
        });
      } else if (error.message?.includes("404")) {
        toast.error("User not found", {
          description: "The user you're trying to promote no longer exists.",
          icon: "❌",
        });
      } else {
        toast.error("Failed to promote user", {
          description: "There was an error promoting the user. Please try again.",
          icon: "❌",
        });
      }
    } finally {
      setPromoteSaving(false);
    }
  }

  async function handleDemoteFromAdmin(userId: string) {
    if (!token) return;
    try {
      await updateUserAdmin(userId, { role: "patient" }, token);
      await loadRolesData();
      toast.success("Admin demoted", {
        description: "The admin has been successfully demoted to regular user.",
        icon: "⬇️",
      });
    } catch (error: any) {
      console.error("Demote admin error:", error);
      if (error.message?.includes("403")) {
        toast.error("Permission denied", {
          description: "You don't have permission to demote this admin. Only super admins can demote other admins.",
          icon: "🚫",
        });
      } else if (error.message?.includes("404")) {
        toast.error("User not found", {
          description: "The user you're trying to demote no longer exists.",
          icon: "❌",
        });
      } else {
        toast.error("Failed to demote admin", {
          description: "There was an error demoting the admin. Please try again.",
          icon: "❌",
        });
      }
    }
  }

  useEffect(() => {
    loadRolesLocal();
  }, []);

  useEffect(() => {
    loadRolesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Reports & Analytics State
  const [reportFrom, setReportFrom] = useState<string>("");
  const [reportTo, setReportTo] = useState<string>("");
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportSummary, setReportSummary] = useState({
    revenueINR: 0,
    totalSessions: 0,
    completedSessions: 0,
    utilizationPct: 0,
    avgRating: 0,
  });
  const [topTherapies, setTopTherapies] = useState<
    Array<{ name: string; count: number }>
  >([]);

  const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.round(value)));

  function withinRange(dateISO: string) {
    const d = new Date(dateISO).getTime();
    const fromOk = reportFrom ? d >= new Date(reportFrom).getTime() : true;
    const toOk = reportTo ? d <= new Date(reportTo).getTime() : true;
    return fromOk && toOk;
  }

  async function computeReports() {
    if (!token) return;
    try {
      setReportsLoading(true);
      // Reuse already-loaded sessions if present, else load
      let data = sessions;
      if (!data || data.length === 0) {
        data = await getAllAppointments(token);
        setSessions(data);
      }

      const filtered = (data || []).filter((s) =>
        withinRange(String(s.startTime))
      );
      const totalSessions = filtered.length;
      const completedSessions = filtered.filter(
        (s) => s.status === "completed"
      ).length;
      const utilizationPct = totalSessions
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

      // Revenue model: per completed session fee from therapy.durationMinutes (fallback flat 800 INR)
      const revenueINR = filtered.reduce((sum, s) => {
        if (s.status !== "completed") return sum;
        const duration = (s.therapy as any)?.durationMinutes || 60;
        const fee = Math.round((duration / 60) * 800); // 800 INR per hour baseline
        return sum + fee;
      }, 0);

      // Ratings from appointment.rating
      const ratings = filtered
        .filter((s) => !!s.rating)
        .map((s) => Number(s.rating));
      const avgRating = ratings.length
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
          ) / 10
        : 0;

      // Top therapies
      const therapyMap: Record<string, number> = {};
      filtered.forEach((s) => {
        const name = (s.therapy as any)?.name || "Unknown";
        therapyMap[name] = (therapyMap[name] || 0) + 1;
      });
      const sortedTherapies = Object.entries(therapyMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setReportSummary({
        revenueINR,
        totalSessions,
        completedSessions,
        utilizationPct,
        avgRating,
      });
      setTopTherapies(sortedTherapies);
    } catch {
      toast.error("Failed to compute reports");
    } finally {
      setReportsLoading(false);
    }
  }

  function exportCsv() {
    const headers = [
      "Revenue(INR)",
      "Total Sessions",
      "Completed Sessions",
      "Utilization(%)",
      "Avg Rating",
    ];
    const row = [
      String(reportSummary.revenueINR),
      String(reportSummary.totalSessions),
      String(reportSummary.completedSessions),
      String(reportSummary.utilizationPct),
      String(reportSummary.avgRating),
    ];
    const csv = [headers.join(","), row.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Simple cross-tab navigation helpers
  const goToMembers = () => setActiveTab("members");

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Admin Toolbar removed (header bell retained near profile) */}
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white relative"
          >
            <div className="flex items-center justify-between">
              <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {displayName || "Admin"}!
            </h1>
            <p className="text-purple-100">
              Manage your clinic operations and monitor performance.
            </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickAlertsDialogOpen(true)}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-200"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Quick Alerts
                    {(pendingDoctors.length > 0 || unreadMessagesCount > 0 || sessions.filter(s => s.status === "delayed").length > 0) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="relative">
              {/* Desktop Tabs */}
              <TabsList className="hidden md:grid grid-cols-7 gap-1 w-full bg-gradient-to-r from-slate-100 to-gray-100 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="home" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
              </TabsTrigger>
                <TabsTrigger 
                  value="approvals" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-600 transition-all duration-300 hover:bg-white/50 rounded-lg relative"
                >
                  <Shield className="h-4 w-4" />
                  <span>Approvals</span>
                  {pendingDoctors.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0">
                      {pendingDoctors.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Users className="h-4 w-4" />
                  <span>Members</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Sessions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-cyan-600 transition-all duration-300 hover:bg-white/50 rounded-lg relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                  {unreadMessagesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white border-0">
                      {unreadMessagesCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                  <span>Roles</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Reports</span>
                </TabsTrigger>
            </TabsList>

              {/* Mobile Tabs */}
              <TabsList className="md:hidden grid grid-cols-4 gap-1 w-full bg-gradient-to-r from-slate-100 to-gray-100 p-1 rounded-xl shadow-inner mb-4">
                <TabsTrigger 
                  value="home" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-xs">Home</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="approvals" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-600 transition-all duration-300 hover:bg-white/50 rounded-lg relative"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Approvals</span>
                  {pendingDoctors.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0">
                      {pendingDoctors.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Members</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Sessions</span>
                </TabsTrigger>
              </TabsList>

              {/* Mobile Secondary Tabs */}
              <TabsList className="md:hidden grid grid-cols-3 gap-1 w-full bg-gradient-to-r from-slate-100 to-gray-100 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="messages" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-cyan-600 transition-all duration-300 hover:bg-white/50 rounded-lg relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">Messages</span>
                  {unreadMessagesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-blue-500 text-white border-0">
                      {unreadMessagesCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Roles</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex flex-col items-center gap-1 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 transition-all duration-300 hover:bg-white/50 rounded-lg"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs">Reports</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="home" className="space-y-6 pt-4">
              {/* Enhanced Quick Actions Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-600">Common administrative tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickActionsDialogOpen(true)}
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </motion.div>
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActionsSettings.showAddMember && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="group"
                    >
                      <Button
                        onClick={goToMembers}
                        className="w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group-hover:shadow-2xl"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                            <UserPlus className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-sm">Add Member</div>
                            <div className="text-xs opacity-90">New user registration</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  )}

                  {quickActionsSettings.showSchedule && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="group"
                    >
                      <Button
                        onClick={() => setActiveTab("sessions")}
                        className="w-full h-24 bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group-hover:shadow-2xl"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                            <Calendar className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-sm">Schedule</div>
                            <div className="text-xs opacity-90">Manage sessions</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  )}

                  {quickActionsSettings.showApprove && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative"
                    >
                      <Button
                        onClick={() => setActiveTab("approvals")}
                        className="w-full h-24 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group-hover:shadow-2xl"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                            <Shield className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-sm">Approve</div>
                            <div className="text-xs opacity-90">Pending requests</div>
                          </div>
                        </div>
                      </Button>
                      {pendingDoctors.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          {pendingDoctors.length}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {quickActionsSettings.showReports && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="group"
                    >
                      <Button
                        onClick={() => setActiveTab("reports")}
                        className="w-full h-24 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group-hover:shadow-2xl"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                            <BarChart3 className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-sm">Reports</div>
                            <div className="text-xs opacity-90">Analytics & insights</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Enhanced System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Patients Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                            Total Patients
                          </p>
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                              {patients.length}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              +12% from last month
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Active Therapists Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                            Active Therapists
                          </p>
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                              {patients.filter(p => p.role === "doctor" && p.isApproved).length}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              {patients.filter(p => p.role === "doctor" && !p.isApproved).length} pending
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Monthly Revenue Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                            Monthly Revenue
                          </p>
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                              ₹{sessions.filter(s => s.status === "completed").length * 2500}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              +8% from last month
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                            <BarChart3 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Utilization Rate Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                            Utilization Rate
                          </p>
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                              {Math.round((sessions.filter(s => s.status === "completed").length / Math.max(sessions.length, 1)) * 100)}%
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              Excellent performance
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                            <Activity className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enhanced Staff Management */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full -translate-y-16 translate-x-16 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center text-xl">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        Staff Management
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage your therapy staff and their assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        {patients.filter(p => p.role === "doctor").slice(0, 3).map((member, index) => {
                          const isApproved = member.isApproved;
                          const patientCount = sessions.filter(s => 
                            String(s.doctor?.uid || s.doctor?._id || s.doctor?.id || s.doctor) === String(member.uid || member._id || member.id)
                          ).length;
                          
                          return (
                            <motion.div
                              key={String(member._id || member.id || member.uid)}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group/item overflow-hidden"
                            >
                              <div className="p-5">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4">
                                    <div className="relative flex-shrink-0">
                                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                                        <Shield className="h-7 w-7 text-white" />
                              </div>
                                      {isApproved && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                                      )}
                            </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 group-hover/item:text-indigo-600 transition-colors duration-300 truncate">
                                          {String(member.name || member.displayName || "Dr. Unknown")}
                                        </h4>
                              <Badge
                                          variant={isApproved ? "default" : "secondary"}
                                          className={`text-xs px-3 py-1 font-medium ${
                                            isApproved 
                                              ? "bg-green-100 text-green-800 border-green-300" 
                                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                          }`}
                                        >
                                          {isApproved ? "✓ Active" : "⏳ Pending"}
                              </Badge>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span className="font-medium">Therapist</span>
                                            <span>•</span>
                                            <span className="font-semibold text-indigo-600">{patientCount} patients</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="truncate">{member.email}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0 ml-4">
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={goToMembers}
                                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                        <Settings className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                                    </motion.div>
                            </div>
                          </div>
                      </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                      <Button
                          className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={goToMembers}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Staff
                      </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Revenue Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-full -translate-y-16 translate-x-16 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center text-xl">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mr-3">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        Revenue Overview
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Monthly revenue trends and analytics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        {[
                          { month: "Jan", amount: 45000, color: "from-blue-500 to-cyan-500", trend: "📉 Low" },
                          { month: "Feb", amount: 52000, color: "from-indigo-500 to-blue-500", trend: "📊 Good" },
                          { month: "Mar", amount: 48000, color: "from-purple-500 to-indigo-500", trend: "📉 Low" },
                          { month: "Apr", amount: 61000, color: "from-green-500 to-teal-500", trend: "📈 High" },
                        ].map((item, index) => {
                          const maxAmount = 70000;
                          const percentage = (item.amount / maxAmount) * 100;
                          
                          return (
                            <motion.div
                            key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 group/item overflow-hidden"
                            >
                              <div className="p-5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300`}>
                                      <DollarSign className="h-6 w-6 text-white" />
                              </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 group-hover/item:text-green-600 transition-colors duration-300">
                                          {item.month}
                                        </h4>
                                        <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-300">
                                          {item.trend}
                                        </Badge>
                            </div>
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-2xl font-bold text-gray-900 group-hover/item:text-green-600 transition-colors duration-300">
                                            ₹{item.amount.toLocaleString()}
                                          </span>
                              </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.5 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
                                            className={`bg-gradient-to-r ${item.color} h-2 rounded-full shadow-sm`}
                                          ></motion.div>
                            </div>
                                        
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>{percentage.toFixed(0)}% of peak</span>
                                          <span className="font-medium">{item.amount >= 60000 ? "Excellent" : item.amount >= 50000 ? "Good" : "Needs Improvement"}</span>
                          </div>
                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                      <Button
                          className="w-full mt-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => {
                          setActiveTab("reports");
                          computeReports();
                        }}
                      >
                          <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Reports
                      </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Enhanced Activity Feed */}
              <div className="grid grid-cols-1 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full -translate-y-16 translate-x-16 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg mr-3">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Live Activity Feed</CardTitle>
                            <CardDescription className="text-gray-600">
                              Real-time updates and system activities
                    </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isActivityLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-500">
                            {isActivityLive ? 'Live' : 'Paused'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsActivityLive(!isActivityLive)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            {isActivityLive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                  </CardHeader>
                    <CardContent className="relative">
                      {activityFeed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                            <Activity className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No recent activity</p>
                          <p className="text-sm text-gray-400">Activity will appear here in real-time</p>
                      </div>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {activityFeed.slice(0, 8).map((activity, index) => {
                            const IconComponent = activity.icon;
                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ scale: 1.02, x: 4 }}
                                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 group/item"
                              >
                                <div className="mt-1">
                                  <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300`}>
                                    <IconComponent className="h-5 w-5 text-white" />
                                  </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 group-hover/item:text-slate-600 transition-colors duration-300">
                                    {activity.title}
                                </div>
                                  {activity.subtitle && (
                                    <div className="text-xs text-gray-500 truncate mt-1">
                                      {activity.subtitle}
                                  </div>
                                )}
                                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(activity.at).toLocaleTimeString()}
                                </div>
                              </div>
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                              </motion.div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="approvals" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Doctor Approvals</CardTitle>
                  <CardDescription>
                    Approve or reject new doctor registrations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                  ) : pendingDoctors.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No pending requests.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingDoctors.map((doc: Record<string, unknown>) => (
                        <div
                            key={String(doc._id || doc.uid || doc.email)}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">
                                  {String(doc.name || doc.displayName || "Doctor")}
                              </div>
                              <div className="text-sm text-gray-500">
                                  {String(doc.email || "")}
                              </div>
                              <div className="mt-1">
                                <Badge variant="secondary">Unapproved</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={async () => {
                                try {
                                  if (!token) return;
                                  await approveUser(
                                    String(doc._id || doc.id || doc.uid),
                                    token
                                  );
                                  await loadPending();
                                } catch {}
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                if (!token) return;
                                const ok = window.confirm(
                                  "Reject this request? This will remove the user."
                                );
                                if (!ok) return;
                                try {
                                  await deleteUserAdmin(
                                    String(doc._id || doc.id || doc.uid),
                                    token
                                  );
                                  toast.success("Doctor request rejected", {
                                    description: "The doctor registration has been rejected and removed.",
                                    icon: "❌",
                                  });
                                  await loadPending();
                                } catch (error) {
                                  toast.error("Failed to reject request", {
                                    description: "There was an error rejecting the doctor request.",
                                    icon: "❌",
                                  });
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="pt-4">
              <div className="space-y-6">
                {/* Enhanced Header Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Members Management</h2>
                      <p className="text-gray-600 text-lg">
                        Manage all users (patients, doctors, admins) across the platform
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          setEditingPatientId(null);
                          setPatientForm({
                            name: "",
                            email: "",
                            role: "patient",
                          });
                          setMemberModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Member
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={loadPatients}
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Search and Filter Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200">
                      <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                        <Settings className="h-6 w-6 text-indigo-600" />
                        Search & Filter Members
                      </CardTitle>
                </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div 
                          className="space-y-3 group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-indigo-600 transition-colors duration-200">
                            <User className="h-5 w-5" />
                            Search Members
                          </label>
                    <Input
                            placeholder="Search by name, email, or role (Dr., Admin, Patient)..."
                      value={patientQuery}
                      onChange={(e) => setPatientQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                                applyPatientFilters();
                              }
                            }}
                            className="border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-400"
                          />
                        </motion.div>
                        <motion.div 
                          className="space-y-3 group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-indigo-600 transition-colors duration-200">
                            <Filter className="h-5 w-5" />
                            Filter by Role
                          </label>
                    <select
                            className="w-full border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-400 rounded-md h-10 px-3"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as any)}
                    >
                            <option value="all">All Roles</option>
                      <option value="patient">Patients</option>
                      <option value="doctor">Doctors</option>
                      <option value="admin">Admins</option>
                    </select>
                        </motion.div>
                        <motion.div 
                          className="space-y-3 group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-indigo-600 transition-colors duration-200">
                            <Activity className="h-5 w-5" />
                            Quick Actions
                          </label>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => applyPatientFilters()}
                              className="flex-1 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 transform hover:scale-105"
                            >
                              <Activity className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button
                              variant="outline"
                      onClick={() => {
                                setPatientQuery("");
                                setRoleFilter("all");
                                // Clear filters and reload
                                loadPatients();
                              }}
                              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            >
                              <X className="h-4 w-4" />
                    </Button>
                  </div>
                        </motion.div>
                        <motion.div 
                          className="space-y-3 group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-indigo-600 transition-colors duration-200">
                            <BarChart3 className="h-5 w-5" />
                            Results Summary
                          </label>
                          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <span className="font-semibold text-indigo-800">
                              {filteredPatients.length} of {patients.length} members
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Members List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-gray-200">
                      <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                        <Users className="h-6 w-6 text-indigo-600" />
                        Members List
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base">
                        View and manage all platform members
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">

                  {/* Create/Edit Member Modal */}
                  <Dialog
                    open={memberModalOpen}
                    onOpenChange={setMemberModalOpen}
                  >
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingPatientId ? "Edit Member" : "New Member"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Full name"
                          value={patientForm.name}
                          onChange={(e) =>
                            setPatientForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Email"
                          value={patientForm.email}
                          onChange={(e) =>
                            setPatientForm((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                        />
                        <select
                          className="border rounded-md h-10 px-3"
                          value={patientForm.role}
                          onChange={(e) =>
                            setPatientForm((f) => ({
                              ...f,
                              role: e.target.value,
                            }))
                          }
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={patientForm.isApproved || false}
                            onChange={(e) =>
                              setPatientForm((f) => ({
                                ...f,
                                isApproved: e.target.checked,
                              }))
                            }
                          />
                          Approved
                        </label>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMemberModalOpen(false);
                            setEditingPatientId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={memberSaving || !patientForm.email.trim()}
                          onClick={async () => {
                            if (!token || !patientForm.email.trim()) return;
                            setMemberSaving(true);
                            try {
                              if (editingPatientId) {
                                await updateUserAdmin(
                                  editingPatientId,
                                  patientForm as any,
                                  token
                                );
                                toast.success("Member updated successfully!", {
                                  description: `The ${patientForm.role} has been successfully updated.`,
                                  icon: "✏️",
                                });
                              } else {
                                await createUserAdmin(
                                  patientForm as any,
                                  token
                                );
                                toast.success("Member created successfully!", {
                                  description: `A new ${patientForm.role} has been added to the system.`,
                                  icon: "👤",
                                });
                              }
                              await loadPatients();
                              setMemberModalOpen(false);
                              setEditingPatientId(null);
                              setPatientForm({
                                name: "",
                                email: "",
                                role: "patient",
                              });
                            } catch (error: any) {
                              console.error("Member operation error:", error);
                              if (error.message?.includes("403")) {
                                toast.error("Permission denied", {
                                  description: "You don't have permission to perform this operation.",
                                  icon: "🚫",
                                });
                              } else if (error.message?.includes("409")) {
                                toast.error("Conflict", {
                                  description: "A member with this email already exists.",
                                  icon: "⚠️",
                                });
                              } else {
                                toast.error("Operation failed", {
                                  description: editingPatientId 
                                    ? "Failed to update member. Please try again."
                                    : "Failed to create member. Please try again.",
                                  icon: "❌",
                                });
                              }
                            } finally {
                              setMemberSaving(false);
                            }
                          }}
                        >
                          {memberSaving
                            ? "Saving…"
                            : editingPatientId
                            ? "Save"
                            : "Create"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                      {/* Enhanced Members List */}
                  {patientsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                          <p className="text-gray-500">Loading members...</p>
                        </div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Users className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {patients.length === 0 ? "No members found" : "No members match your search"}
                          </h3>
                          <p className="text-gray-500 text-center max-w-sm">
                            {patients.length === 0 
                              ? "Get started by adding your first member to the platform."
                              : "No members match your search criteria. Try adjusting your filters."
                            }
                          </p>
                          {patients.length === 0 && (
                            <Button 
                              onClick={() => {
                                setEditingPatientId(null);
                                setPatientForm({
                                  name: "",
                                  email: "",
                                  role: "patient",
                                });
                                setMemberModalOpen(true);
                              }}
                              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add First Member
                            </Button>
                          )}
                    </div>
                  ) : (
                        <div className="space-y-4">
                          {filteredPatients.map((p: Record<string, unknown>, index: number) => {
                        const isSuper =
                              String(p.email || "").toLowerCase() ===
                          SUPER_ADMIN_EMAIL.toLowerCase();
                            const role = p.role || "unknown";
                            const isApproved = !!p.isApproved;
                            
                        return (
                              <motion.div
                                key={String(p._id || p.uid || p.email)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ 
                                  scale: 1.02,
                                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                }}
                                className="bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-indigo-300 group"
                              >
                                <div className="p-6">
                                  <div className="flex items-start justify-between">
                                    {/* Member Info */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                      {/* Avatar */}
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                          role === "admin" 
                                            ? "bg-gradient-to-r from-purple-500 to-pink-600" 
                                            : role === "doctor"
                                            ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                                            : "bg-gradient-to-r from-green-500 to-emerald-600"
                                        }`}
                                      >
                                        <User className="h-6 w-6 text-white" />
                                      </motion.div>
                                      
                                      {/* Details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-800 transition-colors duration-200 truncate">
                                            {String(p.name ||
                                  p.displayName ||
                                  (isSuper
                                    ? SUPER_ADMIN_NAME
                                                : p.email || p.uid))}
                                          </h3>
                                          
                                          {/* Role-based titles and status badges */}
                            <div className="flex items-center gap-2">
                                            {isSuper ? (
                                              <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                              >
                                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                                                  <Shield className="h-3 w-3 mr-1" />
                                                  Super Admin
                              </Badge>
                                              </motion.div>
                                            ) : role === "doctor" ? (
                                              <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                              >
                                                <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-lg">
                                                  <User className="h-3 w-3 mr-1" />
                                                  Dr.
                                                </Badge>
                                              </motion.div>
                                            ) : role === "admin" ? (
                                              <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                              >
                                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                                                  <Shield className="h-3 w-3 mr-1" />
                                                  Admin
                                                </Badge>
                                              </motion.div>
                                            ) : (
                                              <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                              >
                                                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
                                                  <User className="h-3 w-3 mr-1" />
                                                  Patient
                                                </Badge>
                                              </motion.div>
                                            )}

                                            {/* Approval status for non-patients and non-super admins */}
                              {p.role !== "patient" && !isSuper && (
                                              <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                              >
                                <Badge
                                                  variant={isApproved ? "default" : "secondary"}
                                                  className={`font-semibold px-2 py-1 ${
                                                    isApproved 
                                                      ? "bg-green-100 text-green-800 border-green-300" 
                                                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                                  }`}
                                                >
                                                  {isApproved ? "✓ Approved" : "⏳ Pending"}
                                </Badge>
                                              </motion.div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium">Email:</span>
                                            <span className="truncate">{String(p.email || "")}</span>
                                          </div>
                                          {p.uid && typeof p.uid === 'string' ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                              <span className="font-medium">UID:</span>
                                              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                {String(p.uid)}
                                              </code>
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-3 ml-4">

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-2">
                                        {/* View Sessions Button - only for doctors and patients */}
                                        {(role === "doctor" || role === "patient") && (
                                          <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => loadMemberSessions(p)}
                                              disabled={memberSessionsLoading}
                                              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-200"
                                            >
                                              <Calendar className="h-4 w-4 mr-2" />
                                              {memberSessionsLoading ? "Loading..." : "Sessions"}
                                            </Button>
                                          </motion.div>
                                        )}

                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSuper && p.uid !== uid}
                                onClick={() => {
                                  setEditingPatientId(
                                    String(p._id || p.id || p.uid)
                                  );
                                  setPatientForm({
                                    name: isSuper
                                      ? SUPER_ADMIN_NAME
                                      : p.name || p.displayName || "",
                                    email: p.email || "",
                                    role: p.role || "patient",
                                    ...(p.role !== "patient"
                                      ? { isApproved: !!p.isApproved }
                                      : {}),
                                  } as any);
                                  setMemberModalOpen(true);
                                }}
                                            className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                            <Settings className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                                        </motion.div>
                                        
                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSuper && p.uid !== uid}
                                onClick={async () => {
                                  if (!token) return;
                                  const confirmed = window.confirm(
                                    `Are you sure you want to delete ${p.name || p.email}? This action cannot be undone.`
                                  );
                                  if (!confirmed) return;
                                  try {
                                    await deleteUserAdmin(
                                      String(p._id || p.id || p.uid),
                                      token
                                    );
                                    toast.success("Member deleted successfully", {
                                      description: `${p.name || p.email} has been removed from the system.`,
                                      icon: "🗑️",
                                    });
                                    await loadPatients();
                                  } catch (error: any) {
                                    console.error("Delete member error:", error);
                                    if (error.message?.includes("403")) {
                                      toast.error("Permission denied", {
                                        description: "You don't have permission to delete this member.",
                                        icon: "🚫",
                                      });
                                    } else if (error.message?.includes("404")) {
                                      toast.error("Member not found", {
                                        description: "The member you're trying to delete no longer exists.",
                                        icon: "❌",
                                      });
                                    } else {
                                      toast.error("Failed to delete member", {
                                        description: "There was an error deleting the member. Please try again.",
                                        icon: "❌",
                                      });
                                    }
                                  }
                                }}
                                className="border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                              <X className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                                        </motion.div>
                            </div>
                          </div>
                                  </div>
                                </div>
                              </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="pt-4">
              <div className="space-y-6">
                {/* Header Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Therapy Sessions</h2>
                      <p className="text-gray-600 text-lg">
                        Manage schedules and venues across the organization
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => setSessionFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                      New Session
                    </Button>
                      <Button 
                        variant="outline" 
                        onClick={loadSessions}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  </div>
                </motion.div>

                {/* Filter Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                        <Settings className="h-6 w-6 text-blue-600" />
                        Filter Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div 
                        className="space-y-3 group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
                          <User className="h-5 w-5" />
                          Filter by Doctor
                        </label>
                        <Input
                          placeholder="Search by doctor name..."
                          value={sessionDoctorFilter}
                          onChange={(e) => setSessionDoctorFilter(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400"
                        />
                      </motion.div>
                      <motion.div 
                        className="space-y-3 group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
                          <Users className="h-5 w-5" />
                          Filter by Patient
                        </label>
                        <Input
                          placeholder="Search by patient name..."
                          value={sessionPatientFilter}
                          onChange={(e) => setSessionPatientFilter(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400"
                        />
                      </motion.div>
                      <motion.div 
                        className="space-y-3 group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
                          <Calendar className="h-5 w-5" />
                          Filter by Date
                        </label>
                        <Input
                          type="date"
                          value={sessionDateFilter}
                          onChange={(e) => setSessionDateFilter(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400"
                        />
                      </motion.div>
                      <motion.div 
                        className="space-y-3 group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
                          <Filter className="h-5 w-5" />
                          Filter by Status
                        </label>
                        <select
                          value={sessionStatusFilter}
                          onChange={(e) => setSessionStatusFilter(e.target.value)}
                          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 rounded-md h-10 px-3"
                        >
                          <option value="all">All Status</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="delayed">Delayed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </motion.div>
                    </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSessionDoctorFilter("");
                              setSessionPatientFilter("");
                              setSessionDateFilter("");
                              setSessionStatusFilter("all");
                            }}
                            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                          
                          {/* View Toggle */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <Button
                              variant={sessionViewMode === "list" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setSessionViewMode("list")}
                              className={`px-3 py-1 text-xs transition-all duration-200 ${
                                sessionViewMode === "list" 
                                  ? "bg-blue-600 text-white shadow-md" 
                                  : "text-gray-600 hover:text-blue-600"
                              }`}
                            >
                              <List className="h-4 w-4 mr-1" />
                              List
                            </Button>
                            <Button
                              variant={sessionViewMode === "grid" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setSessionViewMode("grid")}
                              className={`px-3 py-1 text-xs transition-all duration-200 ${
                                sessionViewMode === "grid" 
                                  ? "bg-blue-600 text-white shadow-md" 
                                  : "text-gray-600 hover:text-blue-600"
                              }`}
                            >
                              <Grid3X3 className="h-4 w-4 mr-1" />
                              Grid
                            </Button>
                          </div>
                        </div>
                        <motion.div 
                          className="flex items-center gap-3 text-sm text-gray-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-800">
                              Showing {filteredSessions.length} of {sessions.length} sessions
                            </span>
                          </div>
                          {filteredSessions.length !== sessions.length && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                Filtered
                              </Badge>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Sessions List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                      <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        Sessions List
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base">
                        View and manage all therapy sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                  <Dialog
                    open={sessionFormOpen}
                    onOpenChange={setSessionFormOpen}
                  >
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>New Therapy Session</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          className="border rounded-md h-10 px-3"
                          value={sessionForm.patient}
                          onChange={(e) =>
                            setSessionForm((f) => ({
                              ...f,
                              patient: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select patient (UID or ID)</option>
                          {patients
                            .filter(
                              (p: Record<string, unknown>) =>
                                p.role === "patient"
                            )
                            .map((p: Record<string, unknown>) => (
                              <option
                                key={String(p._id || p.uid)}
                                value={String(p.uid || p._id)}
                              >
                                {String(p.name || p.email)}
                              </option>
                            ))}
                        </select>
                        <select
                          className="border rounded-md h-10 px-3"
                          value={sessionForm.doctor}
                          onChange={(e) =>
                            setSessionForm((f) => ({
                              ...f,
                              doctor: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select doctor</option>
                          {doctorsList.map((d: Record<string, unknown>) => (
                            <option key={String(d._id || d.uid)} value={String(d.uid || d._id)}>
                              {String(d.name || d.email)}
                            </option>
                          ))}
                        </select>
                        <select
                          className="border rounded-md h-10 px-3"
                          value={sessionForm.therapy}
                          onChange={(e) =>
                            setSessionForm((f) => ({
                              ...f,
                              therapy: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select therapy</option>
                          {therapiesList.map((t: Record<string, unknown>, index: number) => (
                            <option key={String(t._id || index)} value={String(t._id || "")}>
                              {String(t.name || "")}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="datetime-local"
                          value={sessionForm.startTime}
                          onChange={(e) =>
                            setSessionForm((f) => ({
                              ...f,
                              startTime: e.target.value,
                            }))
                          }
                        />
                        <Input
                          type="datetime-local"
                          value={sessionForm.endTime}
                          onChange={(e) =>
                            setSessionForm((f) => ({
                              ...f,
                              endTime: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Notes (optional)"
                          value={sessionForm.notes}
                          onChange={(e) =>
                            setSessionForm((f) => ({
                              ...f,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSessionFormOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={
                            sessionSaving ||
                            !sessionForm.patient ||
                            !sessionForm.doctor ||
                            !sessionForm.therapy ||
                            !sessionForm.startTime ||
                            !sessionForm.endTime
                          }
                          onClick={async () => {
                            if (!token) return;
                            setSessionSaving(true);
                            try {
                              await createAppointment(
                                {
                                  patient: sessionForm.patient,
                                  doctor: sessionForm.doctor,
                                  therapy: sessionForm.therapy,
                                  startTime: new Date(
                                    sessionForm.startTime
                                  ).toISOString(),
                                  endTime: new Date(
                                    sessionForm.endTime
                                  ).toISOString(),
                                  notes: sessionForm.notes || undefined,
                                },
                                token
                              );
                              toast.success("Session created successfully!", {
                                description: "A new therapy session has been scheduled.",
                                icon: "📅",
                              });
                              await loadSessions();
                              setSessionFormOpen(false);
                              setSessionForm({
                                patient: "",
                                doctor: "",
                                therapy: "",
                                startTime: "",
                                endTime: "",
                                notes: "",
                              });
                            } catch (error) {
                              toast.error("Failed to create session", {
                                description: "There was an error creating the session. Please try again.",
                                icon: "❌",
                              });
                            } finally {
                              setSessionSaving(false);
                            }
                          }}
                        >
                          {sessionSaving ? "Saving…" : "Create"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {sessionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Loading sessions...</p>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {sessions.length === 0 ? "No sessions found" : "No sessions match your filters"}
                      </h3>
                      <p className="text-gray-500 text-center max-w-sm">
                        {sessions.length === 0 
                          ? "Get started by creating your first therapy session." 
                          : "Try adjusting your search criteria or clear the filters to see all sessions."
                        }
                      </p>
                      {sessions.length === 0 && (
                        <Button 
                          onClick={() => setSessionFormOpen(true)}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create First Session
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className={sessionViewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-6"}>
                      {filteredSessions.map((s: any, index: number) => (
                        <motion.div
                          key={String(s._id || s.id)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                          }}
                          className={`bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-300 group ${
                            sessionViewMode === "grid" ? "h-full flex flex-col" : ""
                          }`}
                        >
                          {/* Header with therapy name and status */}
                          <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300 ${
                            sessionViewMode === "grid" ? "p-3" : "p-6"
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-gray-900 group-hover:text-blue-800 transition-colors duration-200 truncate ${
                                  sessionViewMode === "grid" ? "text-base" : "text-xl"
                                }`}>
                                  {String(formatEntityForDisplay(s.therapy) || "Therapy")}
                                </h3>
                            </div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="ml-2 flex-shrink-0"
                              >
                            <Badge
                              variant={
                                s.status === "completed"
                                  ? "default"
                                      : s.status === "delayed"
                                      ? "destructive"
                                      : s.status === "cancelled"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={`font-semibold ${
                                    sessionViewMode === "grid" ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
                                  }`}
                            >
                              {String(s.status || "scheduled")}
                            </Badge>
                              </motion.div>
                            </div>
                            <div className={`flex items-center text-sm text-gray-600 ${
                              sessionViewMode === "grid" ? "flex-col gap-2" : "gap-6"
                            }`}>
                              <motion.div 
                                className={`flex items-center gap-2 bg-white px-2 py-1.5 rounded-md border border-gray-200 group-hover:border-blue-300 transition-all duration-200 ${
                                  sessionViewMode === "grid" ? "w-full text-xs" : "px-3 py-2"
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                <Calendar className={`text-blue-600 ${sessionViewMode === "grid" ? "h-3 w-3" : "h-4 w-4"}`} />
                                <span className="font-medium truncate">
                                  {new Date(s.startTime).toLocaleDateString()}
                                </span>
                              </motion.div>
                              <motion.div 
                                className={`flex items-center gap-2 bg-white px-2 py-1.5 rounded-md border border-gray-200 group-hover:border-blue-300 transition-all duration-200 ${
                                  sessionViewMode === "grid" ? "w-full text-xs" : "px-3 py-2"
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                <Clock className={`text-green-600 ${sessionViewMode === "grid" ? "h-3 w-3" : "h-4 w-4"}`} />
                                <span className="font-medium truncate">
                                  {new Date(s.startTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {new Date(s.endTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </motion.div>
                            </div>
                          </div>

                          {/* Content with patient, doctor, and venue info */}
                          <div className={sessionViewMode === "grid" ? "p-3 flex-1 flex flex-col" : "p-6"}>
                            <div className={`${
                              sessionViewMode === "grid" 
                                ? "flex flex-col gap-2 flex-1" 
                                : "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                            }`}>
                              <motion.div 
                                className={`flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-300 transition-all duration-200 ${
                                  sessionViewMode === "grid" ? "p-2" : "p-4"
                                }`}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className={`bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200 flex-shrink-0 ${
                                  sessionViewMode === "grid" ? "p-1" : "p-2"
                                }`}>
                                  <User className={`text-blue-600 ${sessionViewMode === "grid" ? "h-3 w-3" : "h-5 w-5"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-gray-500 uppercase tracking-wide ${
                                    sessionViewMode === "grid" ? "text-xs font-semibold" : "text-xs font-bold"
                                  }`}>Patient</span>
                                  <p className={`font-semibold text-gray-900 group-hover:text-blue-800 transition-colors duration-200 truncate ${
                                    sessionViewMode === "grid" ? "text-xs" : "text-sm"
                                  }`}>
                                    {String(formatEntityForDisplay(s.patient))}
                                  </p>
                                </div>
                              </motion.div>
                              <motion.div 
                                className={`flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:bg-green-50 group-hover:border-green-300 transition-all duration-200 ${
                                  sessionViewMode === "grid" ? "p-2" : "p-4"
                                }`}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className={`bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-200 flex-shrink-0 ${
                                  sessionViewMode === "grid" ? "p-1" : "p-2"
                                }`}>
                                  <User className={`text-green-600 ${sessionViewMode === "grid" ? "h-3 w-3" : "h-5 w-5"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-gray-500 uppercase tracking-wide ${
                                    sessionViewMode === "grid" ? "text-xs font-semibold" : "text-xs font-bold"
                                  }`}>Doctor</span>
                                  <p className={`font-semibold text-gray-900 group-hover:text-green-800 transition-colors duration-200 truncate ${
                                    sessionViewMode === "grid" ? "text-xs" : "text-sm"
                                  }`}>
                                    {String(formatEntityForDisplay(s.doctor))}
                                  </p>
                                </div>
                              </motion.div>
                            </div>

                            {s.therapy?.venueAddress && (
                              <motion.div 
                                className={`flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:bg-purple-50 group-hover:border-purple-300 transition-all duration-200 ${
                                  sessionViewMode === "grid" ? "p-2 mb-3" : "p-4 mb-6"
                                }`}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className={`bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors duration-200 flex-shrink-0 ${
                                  sessionViewMode === "grid" ? "p-1" : "p-2"
                                }`}>
                                  <Calendar className={`text-purple-600 ${sessionViewMode === "grid" ? "h-3 w-3" : "h-5 w-5"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-gray-500 uppercase tracking-wide ${
                                    sessionViewMode === "grid" ? "text-xs font-semibold" : "text-xs font-bold"
                                  }`}>Venue</span>
                                  <p className={`font-semibold text-gray-900 group-hover:text-purple-800 transition-colors duration-200 truncate ${
                                    sessionViewMode === "grid" ? "text-xs" : "text-sm"
                                  }`}>
                                    {String(s.therapy.venueAddress)}
                                  </p>
                                </div>
                              </motion.div>
                            )}

                            {/* Action buttons */}
                            <div className={`flex items-center gap-2 pt-3 border-t-2 border-gray-200 mt-auto ${
                              sessionViewMode === "grid" ? "flex-col" : "flex-wrap"
                            }`}>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={sessionViewMode === "grid" ? "w-full" : ""}
                              >
                            <Button
                              size="sm"
                                  className={`bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-600 hover:border-green-700 ${
                                    sessionViewMode === "grid" ? "w-full text-xs py-2" : ""
                                  }`}
                                  disabled={s.status === "cancelled" || s.status === "completed"}
                              onClick={() => {
                                if (s.status === "cancelled") {
                                      toast.info("Cancelled sessions cannot be completed.");
                                      return;
                                    }
                                    if (s.status === "completed") {
                                      toast.info("Session is already completed.");
                                  return;
                                }
                                setSessionActionType("complete");
                                setSessionActionTargetId(String(s._id || s.id));
                                    setSessionActionNotes(String(s.notes || ""));
                                setSessionActionOpen(true);
                              }}
                            >
                                  <Check className={`text-white ${sessionViewMode === "grid" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} />
                              Mark Complete
                            </Button>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={sessionViewMode === "grid" ? "w-full" : ""}
                              >
                            <Button
                              variant="outline"
                              size="sm"
                                  className={`border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 shadow-lg hover:shadow-xl transition-all duration-200 ${
                                    sessionViewMode === "grid" ? "w-full text-xs py-2" : ""
                                  }`}
                                  disabled={s.status === "cancelled" || s.status === "completed"}
                              onClick={() => {
                                if (s.status === "cancelled") {
                                      toast.info("Cancelled sessions cannot be delayed.");
                                      return;
                                    }
                                    if (s.status === "completed") {
                                      toast.info("Completed sessions cannot be delayed.");
                                  return;
                                }
                                setSessionActionType("delay");
                                setSessionActionTargetId(String(s._id || s.id));
                                    setSessionActionNotes(String(s.notes || ""));
                                setSessionActionOpen(true);
                              }}
                            >
                                  <Clock className={`text-yellow-700 ${sessionViewMode === "grid" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} />
                              Mark Delayed
                            </Button>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={sessionViewMode === "grid" ? "w-full" : ""}
                              >
                            <Button
                              variant="outline"
                              size="sm"
                                  className={`border-2 border-red-400 text-red-700 hover:bg-red-50 hover:border-red-500 shadow-lg hover:shadow-xl transition-all duration-200 ${
                                    sessionViewMode === "grid" ? "w-full text-xs py-2" : ""
                                  }`}
                              onClick={async () => {
                                if (!token) return;
                                    const confirmed = window.confirm(
                                      "Are you sure you want to delete this session? This action cannot be undone."
                                    );
                                    if (!confirmed) return;
                                await deleteAppointment(
                                  String(s._id || s.id),
                                  token
                                );
                                await loadSessions();
                              }}
                            >
                                  <X className={`text-red-700 ${sessionViewMode === "grid" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} />
                              Delete
                            </Button>
                              </motion.div>
                          </div>
                        </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>
                    WhatsApp-like chat with doctors and patients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="/dashboard/admin/messages">
                    <Button variant="outline">Open Messages</Button>
                  </a>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admins</CardTitle>
                    <CardDescription>
                      Assign sub-roles and manage admin users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rolesLoading ? (
                      <div className="text-sm text-gray-500">Loading…</div>
                    ) : (
                      <div className="space-y-3">
                        {(admins || []).length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No admins yet.
                          </div>
                        ) : (
                          (admins || []).map((a) => {
                            const id = String(a._id || a.id);
                            const label =
                              adminLabels[id] ||
                              (a.email === SUPER_ADMIN_EMAIL
                                ? "super"
                                : "manager");
                            const isSuperLocked =
                              a.email === SUPER_ADMIN_EMAIL ||
                              a.name === SUPER_ADMIN_NAME;
                            return (
                              <div
                                key={id}
                                className="flex items-center justify-between p-3 border rounded-md"
                              >
                                <div>
                                  <div className="font-medium">
                                    {a.name || a.displayName || a.email}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {a.email}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    className="border rounded-md h-9 px-2"
                                    disabled={isSuperLocked}
                                    value={label}
                                    onChange={(e) => {
                                      const next = {
                                        ...adminLabels,
                                        [id]: e.target.value as any,
                                      };
                                      saveAdminLabels(next);
                                    }}
                                  >
                                    <option value="super">Super Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="support">Support</option>
                                  </select>
                                  {!isSuperLocked &&
                                    String(a._id || a.id) !== String(uid) && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDemoteFromAdmin(id)
                                        }
                                      >
                                        Demote
                                      </Button>
                                    )}
                                </div>
                              </div>
                            );
                          })
                        )}

                        <div className="pt-3 border-t mt-3">
                          <div className="text-sm font-medium mb-2">
                            Promote user to admin
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="border rounded-md h-9 px-2 flex-1"
                              value={promoteUserId}
                              onChange={(e) => setPromoteUserId(e.target.value)}
                            >
                              <option value="">Select a user…</option>
                              {(nonAdmins || []).map((u) => (
                                <option
                                  key={String(u._id || u.id)}
                                  value={String(u._id || u.id)}
                                >
                                  {(u.name || u.displayName || u.email) +
                                    " • " +
                                    u.role}
                                </option>
                              ))}
                            </select>
                            <Button
                              onClick={handlePromoteToAdmin}
                              disabled={!promoteUserId || promoteSaving}
                            >
                              Promote
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Permissions Matrix</CardTitle>
                    <CardDescription>
                      Define what each admin sub-role can do
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-accent/30">
                            <th className="text-left p-2 border">Module</th>
                            <th className="text-center p-2 border">
                              Super: View
                            </th>
                            <th className="text-center p-2 border">
                              Super: Manage
                            </th>
                            <th className="text-center p-2 border">
                              Manager: View
                            </th>
                            <th className="text-center p-2 border">
                              Manager: Manage
                            </th>
                            <th className="text-center p-2 border">
                              Support: View
                            </th>
                            <th className="text-center p-2 border">
                              Support: Manage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              "members",
                              "approvals",
                              "sessions",
                              "messages",
                              "reports",
                              "therapies",
                            ] as const
                          ).map((mod) => (
                            <tr key={mod}>
                              <td className="p-2 border font-medium capitalize">
                                {mod}
                              </td>
                              {(
                                ["super", "manager", "support"] as const
                              ).flatMap((r) =>
                                ["view", "manage"].map((cap) => (
                                  <td
                                    key={r + mod + cap}
                                    className="p-2 text-center border"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        permissionsConfig[r][mod][
                                          cap as "view" | "manage"
                                        ]
                                      }
                                      onChange={(e) => {
                                        const next = { ...permissionsConfig };
                                        next[r] = {
                                          ...next[r],
                                          [mod]: {
                                            ...next[r][mod],
                                            [cap]: e.target.checked,
                                          },
                                        } as any;
                                        savePermissionsConfig(next);
                                      }}
                                    />
                                  </td>
                                ))
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      Note: Sub-roles are advisory UI permissions saved locally
                      for now. Core access is enforced by backend role checks.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="pt-4">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">From</div>
                    <Input
                      type="date"
                      value={reportFrom}
                      onChange={(e) => setReportFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">To</div>
                    <Input
                      type="date"
                      value={reportTo}
                      onChange={(e) => setReportTo(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={computeReports}
                      disabled={reportsLoading}
                    >
                      Refresh
                    </Button>
                    <Button onClick={exportCsv} disabled={reportsLoading}>
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="text-2xl font-semibold mt-1">
                        {formatINR(reportSummary.revenueINR)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">Utilization</div>
                      <div className="text-2xl font-semibold mt-1">
                        {reportSummary.utilizationPct}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">Completed</div>
                      <div className="text-2xl font-semibold mt-1">
                        {reportSummary.completedSessions}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">Avg Rating</div>
                      <div className="text-2xl font-semibold mt-1">
                        {reportSummary.avgRating}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Therapies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topTherapies.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No data in selected range.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {topTherapies.map((t) => (
                          <div
                            key={t.name}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <span>{t.name}</span>
                            <span className="text-sm text-gray-600">
                              {t.count} sessions
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Patients
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.systemStats.totalPatients}
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
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Active Therapists
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.systemStats.activeTherapists}
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
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Monthly Revenue
                      </p>
                      <p className="text-2xl font-bold">
                        {formatINR(mockData.systemStats.monthlyRevenue)}
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
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Utilization Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {mockData.systemStats.utilizationRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Staff Management
                  </CardTitle>
                  <CardDescription>
                    Manage your therapy staff and their assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">
                              {member.role} • {member.patients} patients
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={goToMembers}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={goToMembers}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Staff
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue trends and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.revenue.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{item.month}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatINR(item.amount)}</p>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full"
                              style={{
                                width: `${(item.amount / 70000) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Detailed Reports
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activities
                </CardTitle>
                <CardDescription>System activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {activity.type === "staff" ? (
                          <UserPlus className="h-5 w-5 text-blue-500" />
                        ) : activity.type === "report" ? (
                          <BarChart3 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Calendar className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Activities
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Bar */}
          <div className="flex flex-wrap gap-3 items-center rounded-md border p-3 bg-background/50">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm">Pending approvals:</span>
              <Badge variant="secondary">{pendingDoctors.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Unread messages:</span>
              <Badge variant="secondary">{unreadMessagesCount}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Delayed sessions:</span>
              <Badge variant="secondary">
                {
                  (sessions || []).filter(
                    (s: Record<string, unknown>) =>
                      s.status === "delayed" || s.status === "in_progress"
                  ).length
                }
              </Badge>
            </div>
          </div>
        </div>
      </DashboardLayout>
      {/* Notifications Drawer */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications & Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold mb-2">
                Pending Approvals
              </div>
              {pendingDoctors.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No pending doctor requests.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingDoctors.map((doc: Record<string, unknown>) => (
                    <div
                      key={String(doc._id || doc.uid || doc.email)}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {String(doc.name || doc.displayName || "Doctor")}
                        </div>
                        <div className="text-xs text-gray-500">{String(doc.email || "")}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={async () => {
                            try {
                              if (!token) return;
                              await approveUser(
                                String(doc._id || doc.id || doc.uid),
                                token
                              );
                              await loadPending();
                            } catch {}
                          }}
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" disabled>
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Recent Activity</div>
              <div className="space-y-1">
                {mockData.recentActivities.slice(0, 5).map((a) => (
                  <div key={a.id} className="text-sm text-gray-700">
                    • {a.action} —{" "}
                    <span className="text-gray-500">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session action dialog */}
      <Dialog open={sessionActionOpen} onOpenChange={setSessionActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sessionActionType === "complete"
                ? "Mark Session Complete"
                : "Mark Session Delayed"}
            </DialogTitle>
            <DialogDescription>
              Add optional notes before confirming the action. Press Enter to
              save quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add optional notes or recommendations to attach to this session.
            </p>
            <Textarea
              placeholder="Notes / recommendations (optional)"
              value={sessionActionNotes}
              onChange={(e) => setSessionActionNotes(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSessionActionOpen(false)}
                disabled={sessionActionSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={submitSessionAction}
                disabled={sessionActionSubmitting}
              >
                {sessionActionType === "complete"
                  ? "Confirm Complete"
                  : "Confirm Delayed"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member Session History Dialog */}
      <Dialog open={sessionHistoryOpen} onOpenChange={setSessionHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session History - {selectedMemberInfo?.name || selectedMemberInfo?.email}
            </DialogTitle>
            <DialogDescription>
              View all therapy sessions for this {selectedMemberInfo?.role === "doctor" ? "doctor" : "patient"}
            </DialogDescription>
          </DialogHeader>
          {/* Session Summary */}
          {!memberSessionsLoading && selectedMemberSessions.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Session Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedMemberSessions.length}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedMemberSessions.filter(s => s.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedMemberSessions.filter(s => s.status === "scheduled").length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedMemberSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / 
                     selectedMemberSessions.filter(s => s.rating).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[60vh]">
            {memberSessionsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading sessions...</p>
              </div>
            ) : selectedMemberSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sessions found
                </h3>
                <p className="text-gray-500 text-center max-w-sm">
                  This {selectedMemberInfo?.role === "doctor" ? "doctor" : "patient"} has no therapy sessions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedMemberSessions.map((session: any, index: number) => (
                  <motion.div
                    key={String(session._id || session.id || index)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-800 transition-colors duration-200">
                            {String(formatEntityForDisplay(session.therapy) || "Therapy Session")}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>{new Date(session.startTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span>
                                {new Date(session.startTime).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(session.endTime).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            {session.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-purple-600" />
                                <span>{session.duration} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "delayed"
                                ? "destructive"
                                : session.status === "cancelled"
                                ? "secondary"
                                : "outline"
                            }
                            className="font-semibold px-3 py-1"
                          >
                            {String(session.status || "scheduled")}
                          </Badge>
                          {session.rating && (
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              <span>★</span>
                              <span>{session.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Patient</span>
                            <p className="font-semibold text-gray-900">
                              {String(formatEntityForDisplay(session.patient))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Doctor</span>
                            <p className="font-semibold text-gray-900">
                              {String(formatEntityForDisplay(session.doctor))}
                            </p>
                          </div>
                        </div>
                      </div>

                      {session.therapy?.venueAddress && (
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-4">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Venue</span>
                            <p className="font-semibold text-gray-900">
                              {String(session.therapy.venueAddress)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Wellness Metrics */}
                      {(session.painLevel || session.energyLevel || session.moodLevel || session.sleepQuality || session.overallWellness) && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                          <span className="text-xs font-bold text-green-600 uppercase tracking-wide mb-3 block">Wellness Metrics</span>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {session.painLevel !== undefined && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-red-600">{session.painLevel}/10</div>
                                <div className="text-xs text-gray-600">Pain Level</div>
                              </div>
                            )}
                            {session.energyLevel !== undefined && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-yellow-600">{session.energyLevel}/10</div>
                                <div className="text-xs text-gray-600">Energy</div>
                              </div>
                            )}
                            {session.moodLevel !== undefined && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{session.moodLevel}/10</div>
                                <div className="text-xs text-gray-600">Mood</div>
                              </div>
                            )}
                            {session.sleepQuality !== undefined && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{session.sleepQuality}/10</div>
                                <div className="text-xs text-gray-600">Sleep</div>
                              </div>
                            )}
                            {session.overallWellness !== undefined && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{session.overallWellness}/10</div>
                                <div className="text-xs text-gray-600">Overall</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Symptoms and Improvements */}
                      {(session.symptoms?.length > 0 || session.improvements?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {session.symptoms?.length > 0 && (
                            <div className="bg-red-50 rounded-lg p-3">
                              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Symptoms</span>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {session.symptoms.map((symptom: string, idx: number) => (
                                  <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {session.improvements?.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-3">
                              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Improvements</span>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {session.improvements.map((improvement: string, idx: number) => (
                                  <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    {improvement}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {session.notes && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Notes</span>
                          <p className="text-sm text-gray-700 mt-1">{String(session.notes)}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSessionHistoryOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions Settings Dialog */}
      <Dialog open={quickActionsDialogOpen} onOpenChange={setQuickActionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customize Quick Actions
            </DialogTitle>
            <DialogDescription>
              Choose which quick actions to display on your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Add Member</p>
                    <p className="text-sm text-gray-500">New user registration</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleQuickAction('showAddMember')}
                  className={quickActionsSettings.showAddMember ? 'bg-indigo-100 border-indigo-300' : ''}
                >
                  {quickActionsSettings.showAddMember ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Schedule</p>
                    <p className="text-sm text-gray-500">Manage sessions</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleQuickAction('showSchedule')}
                  className={quickActionsSettings.showSchedule ? 'bg-green-100 border-green-300' : ''}
                >
                  {quickActionsSettings.showSchedule ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Approve</p>
                    <p className="text-sm text-gray-500">Pending requests</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleQuickAction('showApprove')}
                  className={quickActionsSettings.showApprove ? 'bg-amber-100 border-amber-300' : ''}
                >
                  {quickActionsSettings.showApprove ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Reports</p>
                    <p className="text-sm text-gray-500">Analytics & insights</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleQuickAction('showReports')}
                  className={quickActionsSettings.showReports ? 'bg-blue-100 border-blue-300' : ''}
                >
                  {quickActionsSettings.showReports ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetQuickActions}
                className="text-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button
                onClick={() => setQuickActionsDialogOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Alerts Dialog */}
      <Dialog open={quickAlertsDialogOpen} onOpenChange={setQuickAlertsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Quick Alerts Dashboard
            </DialogTitle>
            <DialogDescription>
              Monitor all system alerts and notifications in one place
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Pending Approvals */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl border border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-300 group/item overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover/item:text-red-600 transition-colors duration-300">Pending Approvals</h4>
                      <p className="text-sm text-gray-500">Doctor registrations awaiting review</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800 border-red-300 text-lg px-3 py-1 font-bold">
                      {pendingDoctors.length}
                    </Badge>
                    {pendingDoctors.length > 0 && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                {pendingDoctors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <Button
                      onClick={() => {
                        setQuickAlertsDialogOpen(false);
                        setActiveTab("approvals");
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Review Pending Approvals
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Unread Messages */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group/item overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover/item:text-blue-600 transition-colors duration-300">Unread Messages</h4>
                      <p className="text-sm text-gray-500">Patient communications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-lg px-3 py-1 font-bold">
                      {unreadMessagesCount}
                    </Badge>
                    {unreadMessagesCount > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                {unreadMessagesCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <Button
                      onClick={() => {
                        setQuickAlertsDialogOpen(false);
                        setActiveTab("messages");
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Delayed Sessions */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl border border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all duration-300 group/item overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover/item:text-yellow-600 transition-colors duration-300">Delayed Sessions</h4>
                      <p className="text-sm text-gray-500">Requires immediate attention</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-lg px-3 py-1 font-bold">
                      {sessions.filter(s => s.status === "delayed").length}
                    </Badge>
                    {sessions.filter(s => s.status === "delayed").length > 0 && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                {sessions.filter(s => s.status === "delayed").length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-100">
                    <Button
                      onClick={() => {
                        setQuickAlertsDialogOpen(false);
                        setActiveTab("sessions");
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Manage Sessions
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Feed Summary */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 group/item overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover/item:text-slate-600 transition-colors duration-300">Live Activity</h4>
                      <p className="text-sm text-gray-500">Recent system activities</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-slate-100 text-slate-800 border-slate-300 text-lg px-3 py-1 font-bold">
                      {activityFeed.length}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${isActivityLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setQuickAlertsDialogOpen(false);
                      setActiveTab("home");
                    }}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View Activity Feed
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

    </ProtectedRoute>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
