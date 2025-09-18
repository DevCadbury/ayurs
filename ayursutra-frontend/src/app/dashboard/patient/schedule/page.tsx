"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";
import {
  getPatientAppointments,
  createAppointment,
  updateAppointmentStatus,
  getDoctors,
  getTherapies,
  getAllAppointments,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Phone,
  Video,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  CalendarDays,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  listMessageThreads,
  listChatMessages,
  sendChatMessage,
} from "@/lib/api";

// Types
interface Appointment {
  id: string;
  date: string;
  time: string;
  endTime: string;
  therapist: {
    id: string;
    name: string;
    specialization: string;
    avatar?: string;
  };
  therapy: {
    id: string;
    name: string;
    description: string;
    duration: number;
  };
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  location: string;
  notes?: string;
  type: "in_person" | "video_call";
}

interface Therapy {
  id: string;
  name: string;
  description: string;
  duration: number;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
}

// No mock data - using real backend data only

export default function PatientSchedulePage() {
  const { uid, role, displayName, token } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedDoctorSlots, setSelectedDoctorSlots] = useState<Record<string, string[]>>({});
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    time: "",
    therapist: "",
    therapy: "",
    type: "in_person" as "in_person" | "video_call",
    notes: "",
  });

  // Chat dialog state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeDoctor, setActiveDoctor] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [chatAttachmentUrl, setChatAttachmentUrl] = useState("");
  const chatEndRef = useState<HTMLDivElement | null>(null)[0];

  // Mock payment state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");


  const scrollChatToBottom = () => {
    try {
      const el = document.getElementById("chat-end");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch {}
  };

  // Generate time slots for a given date
  const generateTimeSlots = (date: string) => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Check if a time slot is available for a specific doctor and date
  const isTimeSlotAvailable = (doctorId: string, date: string, time: string) => {
    // Since patients can't access all appointments, we'll use a simplified check
    // In a real app, this would be handled by the backend
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // 30 minutes duration
    
    // Check against patient's own appointments for basic validation
    const hasConflict = appointments.some((apt: any) => {
      if (apt.therapist.id !== doctorId) return false;
      if (apt.date !== date) return false;
      
      const aptStart = new Date(`${apt.date}T${apt.time}:00`);
      const aptEnd = new Date(aptStart.getTime() + (apt.therapy.duration || 60) * 60000);
      
      // Check for time overlap
      const hasTimeOverlap = (
        (appointmentDateTime >= aptStart && appointmentDateTime < aptEnd) ||
        (endTime > aptStart && endTime <= aptEnd) ||
        (appointmentDateTime <= aptStart && endTime >= aptEnd)
      );
      
      return hasTimeOverlap && apt.status !== 'cancelled';
    });
    
    return !hasConflict;
  };

  // Get available time slots for a specific doctor and date
  const getAvailableTimeSlots = (doctorId: string, date: string) => {
    const allSlots = generateTimeSlots(date);
    return allSlots.filter(time => isTimeSlotAvailable(doctorId, date, time));
  };

  // Update available slots when doctor or date changes
  const updateAvailableSlots = (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const available = getAvailableTimeSlots(doctorId, date);
    setAvailableTimeSlots(available);
    setSelectedDoctorSlots(prev => ({
      ...prev,
      [`${doctorId}-${date}`]: available
    }));
  };

  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return allAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.startTime || '').toISOString().split('T')[0];
      return aptDate === dateString;
    });
  };

  const isDateBooked = (date: Date) => {
    const appointments = getAppointmentsForDate(date);
    return appointments.length > 0;
  };

  const getBookedSlotsCount = (date: Date) => {
    const appointments = getAppointmentsForDate(date);
    return appointments.length;
  };

  async function openChatForDoctor(
    doctorId: string,
    doctorName: string,
    doctorAvatar?: string
  ) {
    if (!uid || !token) return;
    setChatError(null);
    setChatLoading(true);
    setActiveDoctor({ id: doctorId, name: doctorName, avatar: doctorAvatar });
    try {
      const threads = await listMessageThreads(uid, token);
      const thread = threads.find(
        (t) => String(t.doctor?.id) === String(doctorId)
      );
      if (!thread) {
        // Fallback: pick first thread; backend usually ensures per doctor
        if (threads[0]) {
          setActiveChatId(threads[0].chatId);
        } else {
          setChatError("No chat thread found for this therapist.");
          setIsChatOpen(true);
          setChatLoading(false);
          return;
        }
      } else {
        setActiveChatId(thread.chatId);
      }
      const chatId =
        (thread && thread.chatId) || (threads[0] && threads[0].chatId);
      if (chatId) {
        const res = await listChatMessages(chatId, token, uid);
        setChatMessages(res.messages || []);
      }
      setIsChatOpen(true);
      setTimeout(scrollChatToBottom, 0);
    } catch (err: unknown) {
      setChatError((err as Error)?.message || "Failed to open chat");
      setIsChatOpen(true);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSendChat() {
    if (!activeChatId || !uid || !token) return;
    if (!chatText.trim() && !chatAttachmentUrl.trim()) return;
    try {
      const res = await sendChatMessage(
        activeChatId,
        {
          senderId: uid,
          text: chatText.trim() || undefined,
          attachmentUrl: chatAttachmentUrl.trim() || undefined,
        },
        token
      );
      setChatMessages(res.messages || []);
      setChatText("");
      setChatAttachmentUrl("");
      setTimeout(scrollChatToBottom, 0);
    } catch (err: unknown) {
      setChatError((err as Error)?.message || "Failed to send message");
    }
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!uid || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        const [appointmentsData, doctorsData, therapiesData] =
          await Promise.all([
            getPatientAppointments(uid, token),
            getDoctors(token),
            getTherapies(token),
          ]);

        // Transform API data to match our interface
        const transformedAppointments = (appointmentsData || []).map(
          (apt: Record<string, unknown>) => {
            const doctor = apt?.doctor || {};
            const therapy = apt?.therapy || {};
            return {
              id: apt?._id || apt?.id || String(Math.random()),
              date: apt?.startTime
                ? new Date(apt.startTime as string).toISOString().split("T")[0]
                : "",
              time: apt?.startTime
                ? new Date(apt.startTime as string).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "",
              endTime: apt?.endTime
                ? new Date(apt.endTime as string).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "",
              therapist: {
                id: (doctor as any)?._id || (doctor as any)?.id || "",
                name: (doctor as any)?.name || "Doctor",
                specialty: (doctor as any)?.specialty || "Ayurvedic Specialist",
                avatar: (doctor as any)?.avatar || undefined,
              },
              therapy: {
                id: (therapy as any)?._id || (therapy as any)?.id || "",
                name: (therapy as any)?.name || "Therapy",
                description: (therapy as any)?.description || "",
                duration: (therapy as any)?.durationMinutes || (therapy as any)?.duration || 0,
              },
              status: apt?.status || "scheduled",
              location:
                apt?.type === "video_call" ? "Video Call" : "Wellness Center",
              notes: apt?.notes || "",
              type: apt?.type || "in_person",
            };
          }
        );

        const transformedDoctors = (doctorsData || []).map(
          (doc: Record<string, unknown>) => ({
            id: doc?._id || doc?.id,
            name: doc?.name || doc?.displayName || doc?.email || "Doctor",
            specialty: doc?.specialty || "Ayurvedic Specialist",
            avatar: doc?.avatar || undefined,
          })
        );

        const transformedTherapies = therapiesData.map(
          (therapy: Record<string, unknown>) => ({
            id: therapy._id,
            name: therapy.name,
            description: therapy.description || "",
            duration: therapy.durationMinutes,
          })
        );

        setAppointments(transformedAppointments);
        setAllAppointments([]); // Patients can't access all appointments
        setDoctors(transformedDoctors);
        setTherapies(transformedTherapies);
    } catch (err: any) {
        console.error("Error loading data:", err);
        setError("Failed to load schedule data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [uid, token]);

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.therapy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  // Update available time slots when doctor or date changes
  useEffect(() => {
    if (newAppointment.therapist && newAppointment.date) {
      updateAvailableSlots(newAppointment.therapist, newAppointment.date);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [newAppointment.therapist, newAppointment.date, allAppointments]);

  // Refresh appointments data when dialog opens
  useEffect(() => {
    if (isNewAppointmentOpen && uid && token) {
      const refreshData = async () => {
        try {
          const appointmentsData = await getPatientAppointments(uid, token);
          
          const transformedAppointments = (appointmentsData || []).map(
            (apt: Record<string, unknown>) => {
              const doctor = apt?.doctor || {};
              const therapy = apt?.therapy || {};
              return {
                id: apt?._id || apt?.id || String(Math.random()),
                date: apt?.startTime
                  ? new Date(apt.startTime as string).toISOString().split("T")[0]
                  : "",
                time: apt?.startTime
                  ? new Date(apt.startTime as string).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "",
                endTime: apt?.endTime
                  ? new Date(apt.endTime as string).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "",
                therapist: {
                  id: (doctor as any)?._id || (doctor as any)?.id || "",
                  name: (doctor as any)?.name || "Doctor",
                  specialty: (doctor as any)?.specialty || "Ayurvedic Specialist",
                  avatar: (doctor as any)?.avatar || undefined,
                },
                therapy: {
                  id: (therapy as any)?._id || (therapy as any)?.id || "",
                  name: (therapy as any)?.name || "Therapy",
                  description: (therapy as any)?.description || "",
                  duration: (therapy as any)?.durationMinutes || (therapy as any)?.duration || 0,
                },
                status: apt?.status || "scheduled",
                location:
                  apt?.type === "video_call" ? "Video Call" : "Wellness Center",
                notes: apt?.notes || "",
                type: apt?.type || "in_person",
              };
            }
          );
          
          setAppointments(transformedAppointments);
          setAllAppointments([]); // Patients can't access all appointments
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };
      
      refreshData();
    }
  }, [isNewAppointmentOpen, uid, token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleBookAppointment = async () => {
    if (!uid || !token) return;

    try {
      const selectedTherapy = therapies.find(
        (t) => t.id === newAppointment.therapy
      );
      if (!selectedTherapy) {
        toast.error("Please select a therapy", {
          description: "You need to choose a therapy before booking.",
          icon: "⚠️",
        });
        return;
      }

      // Check if the selected time slot is still available
      if (!isTimeSlotAvailable(newAppointment.therapist, newAppointment.date, newAppointment.time)) {
        toast.error("Time slot no longer available", {
          description: "This time slot has been booked by another patient. Please select a different time.",
          icon: "⚠️",
        });
        return;
      }

      // Open payment dialog instead of direct booking
      const mins = selectedTherapy.duration || 60;
      const amount = Math.max(300, Math.round((mins / 60) * 800));
      setPaymentAmount(amount);
      setIsPaymentOpen(true);
    } catch (err: any) {
      console.error("Error booking appointment:", err);
      toast.error("Booking failed", {
        description: err.message || "There was an error booking your appointment. Please try again.",
        icon: "❌",
      });
    }
  };

  async function confirmPaymentAndCreate() {
    if (!uid || !token) return;
    const selectedTherapy = therapies.find(
      (t) => t.id === newAppointment.therapy
    );
    if (!selectedTherapy) return;
    setProcessingPayment(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      if (paymentMethod === "upi" && (!upiId || !/[@]/.test(upiId))) {
        toast.error("Enter a valid UPI ID (e.g., name@bank)");
        setProcessingPayment(false);
        return;
      }
      if (
        paymentMethod === "card" &&
        (cardNumber.replace(/\s+/g, "").length < 12 ||
          !cardExpiry ||
          cardCvv.length < 3)
      ) {
        toast.error("Enter valid card details");
        setProcessingPayment(false);
        return;
      }

      const startTime = new Date(
        `${newAppointment.date}T${newAppointment.time}:00`
      );
      const endTime = new Date(
        startTime.getTime() + (selectedTherapy.duration || 60) * 60000
      );
      const appointmentData = {
        patient: uid,
        doctor: newAppointment.therapist,
        therapy: newAppointment.therapy,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: `${
          newAppointment.notes || ""
        }\n[Paid: INR ${paymentAmount} via ${paymentMethod.toUpperCase()}]`,
        type: newAppointment.type,
      };
      const created = await createAppointment(appointmentData, token);
      const newApt: Appointment = {
        id: created._id,
        date: newAppointment.date,
        time: newAppointment.time,
        endTime: endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        therapist: doctors.find((d) => d.id === newAppointment.therapist)!,
        therapy: selectedTherapy,
        status: "scheduled",
        location:
          newAppointment.type === "in_person"
            ? "Wellness Center"
            : "Video Call",
        notes: newAppointment.notes,
        type: newAppointment.type,
      };
      setAppointments([...appointments, newApt]);
      setIsPaymentOpen(false);
      setIsNewAppointmentOpen(false);
      setNewAppointment({
        date: "",
        time: "",
        therapist: "",
        therapy: "",
        type: "in_person",
        notes: "",
      });
      toast.success("Payment successful. Appointment booked.");
    } catch (e: any) {
      console.error("Booking error:", e);
      
      // Handle scheduling conflict specifically
      if (e.message?.includes("Scheduling conflict detected")) {
        toast.error("Time slot is no longer available", {
          description: "This time slot has been booked by another patient. Please select a different time.",
          icon: "⚠️",
        });
        
        // Refresh appointments data to get latest availability
        try {
          const appointmentsData = await getPatientAppointments(uid, token);
          
          // Transform and update data
          const transformedAppointments = (appointmentsData || []).map(
            (apt: Record<string, unknown>) => {
              const doctor = apt?.doctor || {};
              const therapy = apt?.therapy || {};
              return {
                id: apt?._id || apt?.id || String(Math.random()),
                date: apt?.startTime
                  ? new Date(apt.startTime as string).toISOString().split("T")[0]
                  : "",
                time: apt?.startTime
                  ? new Date(apt.startTime as string).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "",
                endTime: apt?.endTime
                  ? new Date(apt.endTime as string).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "",
                therapist: {
                  id: (doctor as any)?._id || (doctor as any)?.id || "",
                  name: (doctor as any)?.name || "Doctor",
                  specialty: (doctor as any)?.specialty || "Ayurvedic Specialist",
                  avatar: (doctor as any)?.avatar || undefined,
                },
                therapy: {
                  id: (therapy as any)?._id || (therapy as any)?.id || "",
                  name: (therapy as any)?.name || "Therapy",
                  description: (therapy as any)?.description || "",
                  duration: (therapy as any)?.durationMinutes || (therapy as any)?.duration || 0,
                },
                status: apt?.status || "scheduled",
                location:
                  apt?.type === "video_call" ? "Video Call" : "Wellness Center",
                notes: apt?.notes || "",
                type: apt?.type || "in_person",
              };
            }
          );
          
          setAppointments(transformedAppointments);
          setAllAppointments([]); // Patients can't access all appointments
          
          // Clear the selected time to force user to reselect
          setNewAppointment(prev => ({
            ...prev,
            time: ""
          }));
          
        } catch (refreshError) {
          console.error("Error refreshing appointments:", refreshError);
        }
      } else {
        toast.error("Booking failed", {
          description: e.message || "There was an error booking your appointment. Please try again.",
          icon: "❌",
        });
      }
    } finally {
      setProcessingPayment(false);
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!token) return;

    try {
      await updateAppointmentStatus(appointmentId, "cancelled", token);
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "cancelled" as const }
            : apt
        )
      );
      setError(null);
    } catch (err: any) {
      console.error("Error cancelling appointment:", err);
      setError(err.message || "Failed to cancel appointment");
    }
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // In a real app, this would open a reschedule dialog
    console.log("Reschedule appointment:", appointmentId);
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your schedule...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-4xl font-bold mb-2">My Schedule</h1>
                <p className="text-indigo-100 text-lg">
                Manage your therapy appointments and sessions
              </p>
            </div>
            <Dialog
              open={isNewAppointmentOpen}
              onOpenChange={setIsNewAppointmentOpen}
              modal={false}
            >
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4" />
                  Book Appointment
                </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white">
                <DialogHeader className="text-center pb-8">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <DialogTitle className="text-3xl font-bold text-gray-800 mb-2">Book New Appointment</DialogTitle>
                  <DialogDescription className="text-xl text-gray-600 font-medium">
                    Schedule a new therapy session with your preferred doctor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="date" className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                        <div className="p-1 bg-indigo-100 rounded-full">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        Appointment Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) =>
                          setNewAppointment({
                            ...newAppointment,
                            date: e.target.value,
                          })
                        }
                        className="border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200 h-14 text-lg rounded-xl shadow-sm hover:shadow-md"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="time" className="text-sm font-semibold text-gray-700 mb-2 block">
                        ⏰ Time Slots
                      </Label>
                      <div className="space-y-3">
                        {newAppointment.therapist && newAppointment.date ? (
                          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-3 border-2 border-gray-300 rounded-xl bg-white shadow-lg">
                          {generateTimeSlots(newAppointment.date).map((time) => {
                            const isAvailable = isTimeSlotAvailable(newAppointment.therapist, newAppointment.date, time);
                            const isSelected = newAppointment.time === time;
                            return (
                              <motion.button
                                key={time}
                                whileHover={isAvailable ? { scale: 1.05, y: -2 } : {}}
                                whileTap={isAvailable ? { scale: 0.95 } : {}}
                                onClick={() => {
                                  if (isAvailable) {
                                    setNewAppointment({
                                      ...newAppointment,
                                      time: time,
                                    });
                                  }
                                }}
                                disabled={!isAvailable}
                                className={`relative p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                                    : isAvailable
                                    ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 hover:border-green-400 cursor-pointer'
                                    : 'bg-red-50 text-red-600 border-red-300 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <Clock className={`h-4 w-4 ${
                                    isSelected 
                                      ? 'text-white' 
                                      : isAvailable 
                                      ? 'text-green-600' 
                                      : 'text-red-500'
                                  }`} />
                                  
                                  <span className={`font-bold text-sm ${
                                    isSelected 
                                      ? 'text-white' 
                                      : isAvailable 
                                      ? 'text-green-800' 
                                      : 'text-red-600'
                                  }`}>
                                    {time}
                                  </span>
                                  
                                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    isSelected 
                                      ? 'bg-white/20 text-white' 
                                      : isAvailable 
                                      ? 'bg-green-200 text-green-800' 
                                      : 'bg-red-200 text-red-800'
                                  }`}>
                                    {isSelected ? 'Selected' : isAvailable ? 'Available' : 'Booked'}
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <motion.div 
                          className="p-8 text-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Select Doctor & Date</p>
                          <p className="text-sm">Choose a doctor and date to view available time slots</p>
                        </motion.div>
                      )}
                      
                      {newAppointment.therapist && newAppointment.date && (
                        <motion.div
                          className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg border border-green-300">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-800 font-bold text-sm">
                                  {availableTimeSlots.length} Available
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg border border-red-300">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-800 font-bold text-sm">
                                  {generateTimeSlots(newAppointment.date).length - availableTimeSlots.length} Booked
                                </span>
                              </div>
                            </div>
                            {newAppointment.time && (
                              <div className="flex justify-center">
                                <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Selected: {newAppointment.time}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="therapist" className="text-sm font-semibold text-gray-700 mb-2 block">
                      👨‍⚕️ Doctor
                    </Label>
                    <Select
                      value={newAppointment.therapist}
                      onValueChange={(value) =>
                        setNewAppointment({
                          ...newAppointment,
                          therapist: value,
                        })
                      }
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200 h-12 text-lg">
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[1000]">
                        {doctors.length === 0 ? (
                          <SelectItem disabled value="__none">
                            No doctors found
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialization}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="therapy" className="text-sm font-semibold text-gray-700 mb-2 block">
                      🧘‍♀️ Therapy
                    </Label>
                    <Select
                      value={newAppointment.therapy}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, therapy: value })
                      }
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200 h-12 text-lg">
                        <SelectValue placeholder="Select a therapy" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[1000]">
                        {therapies.length === 0 ? (
                          <SelectItem disabled value="__none">
                            No therapies found
                          </SelectItem>
                        ) : (
                          therapies.map((therapy) => (
                            <SelectItem key={therapy.id} value={therapy.id}>
                              {therapy.name} ({therapy.duration} min)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="type" className="text-sm font-semibold text-gray-700 mb-2 block">
                      📍 Session Type
                    </Label>
                    <Select
                      value={newAppointment.type}
                      onValueChange={(value: "in_person" | "video_call") =>
                        setNewAppointment({ ...newAppointment, type: value })
                      }
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200 h-12 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[1000]">
                        <SelectItem value="in_person">In-Person</SelectItem>
                        <SelectItem value="video_call">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 mb-2 block">
                      📝 Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or notes..."
                      value={newAppointment.notes}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          notes: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200 min-h-[100px] text-lg"
                    />
                  </motion.div>
                  
                  <div className="flex gap-4 pt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                    <Button
                      variant="outline"
                      onClick={() => setIsNewAppointmentOpen(false)}
                        className="w-full h-12 text-lg border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                    <Button
                      onClick={handleBookAppointment}
                        className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-bold"
                      disabled={
                        !newAppointment.date ||
                        !newAppointment.time ||
                        !newAppointment.therapist ||
                        !newAppointment.therapy
                      }
                    >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-6 w-6" />
                          <span>Book Appointment</span>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                    </Button>
                    </motion.div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                  placeholder="Search appointments by doctor or therapy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-2 border-gray-200 focus:border-indigo-500 transition-colors duration-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowCalendarView(!showCalendarView)}
                  className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
                >
                  {showCalendarView ? <EyeOff className="h-4 w-4 mr-2" /> : <CalendarDays className="h-4 w-4 mr-2" />}
                  {showCalendarView ? "Hide Calendar" : "Show Calendar"}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Calendar View */}
          {showCalendarView && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Appointment Calendar</h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                  <span className="text-lg font-semibold text-gray-700 min-w-[200px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentMonth).map((day, index) => (
                  <motion.div
                    key={index}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all duration-200 ${
                      day
                        ? isDateBooked(day)
                          ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50'
                    }`}
                    whileHover={day ? { scale: 1.05 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {day && (
                      <div className="text-center">
                        <div className="text-sm font-semibold">{day.getDate()}</div>
                        {isDateBooked(day) && (
                          <div className="text-xs mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-1"></div>
                            <span className="text-xs">{getBookedSlotsCount(day)} booked</span>
                          </div>
                        )}
                        {!isDateBooked(day) && (
                          <div className="text-xs mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Booked</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No appointments found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "You don't have any appointments scheduled yet"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => setIsNewAppointmentOpen(true)}>
                      Book Your First Appointment
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 group-hover:from-indigo-50 group-hover:to-blue-50">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Date and Time */}
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className="text-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-4 min-w-[80px] shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {(() => {
                              const d = appointment.date
                                ? new Date(appointment.date)
                                : null;
                              const valid = d && !isNaN(d.getTime());
                              const day = valid ? d!.getDate() : "--";
                              const month = valid
                                ? d!.toLocaleDateString("en-US", {
                                    month: "short",
                                  })
                                : "";
                              return (
                                <>
                                  <div className="text-2xl font-bold">
                                    {day}
                                  </div>
                                  <div className="text-sm opacity-90">
                                    {month}
                                  </div>
                                </>
                              );
                            })()}
                          </motion.div>
                          <div className="flex-1">
                            <motion.div 
                              className="flex items-center gap-2 mb-2"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-1.5 bg-blue-100 rounded-full">
                                <Clock className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-semibold text-gray-800 text-lg">
                                {appointment.time} - {appointment.endTime}
                              </span>
                            </motion.div>
                            <motion.div 
                              className="flex items-center gap-2"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className={`p-1.5 rounded-full ${
                                appointment.type === "video_call" 
                                  ? "bg-blue-100" 
                                  : "bg-green-100"
                              }`}>
                              {appointment.type === "video_call" ? (
                                  <Video className="h-4 w-4 text-blue-600" />
                              ) : (
                                  <MapPin className="h-4 w-4 text-green-600" />
                              )}
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {appointment.location}
                              </span>
                            </motion.div>
                          </div>
                        </div>

                        {/* Therapy and Doctor Info */}
                        <div className="flex-1">
                          <motion.h3 
                            className="font-bold text-gray-900 mb-2 text-xl group-hover:text-indigo-700 transition-colors duration-200"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            {appointment.therapy.name}
                          </motion.h3>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {appointment.therapy.description}
                          </p>
                          <motion.div 
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors duration-200"
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-2 bg-indigo-100 rounded-full">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-800">
                              {appointment.therapist.name}
                            </span>
                              <span className="text-sm text-gray-500 ml-2">
                              - {appointment.therapist.specialization}
                            </span>
                          </div>
                          </motion.div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                          <Badge
                            className={`${getStatusColor(
                              appointment.status
                              )} flex items-center gap-2 px-3 py-1.5 text-sm font-semibold shadow-sm`}
                          >
                            {getStatusIcon(appointment.status)}
                            {appointment.status.replace("_", " ")}
                          </Badge>
                          </motion.div>
                          {appointment.status === "scheduled" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
                                  >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                                </motion.div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRescheduleAppointment(appointment.id)
                                  }
                                  className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCancelAppointment(appointment.id)
                                  }
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {appointment.status === "scheduled" && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openChatForDoctor(
                                  appointment.therapist.id,
                                  appointment.therapist.name,
                                  appointment.therapist.avatar
                                )
                              }
                                className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat
                            </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <motion.div 
                          className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-l-4 border-indigo-400"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-sm text-gray-700 leading-relaxed">
                            <strong className="text-indigo-700">Notes:</strong> {appointment.notes}
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                  {
                    appointments.filter((apt) => apt.status === "scheduled")
                      .length
                  }
                </div>
                  <div className="text-sm font-semibold text-blue-700">Upcoming</div>
              </CardContent>
            </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                  {
                    appointments.filter((apt) => apt.status === "completed")
                      .length
                  }
                </div>
                  <div className="text-sm font-semibold text-green-700">Completed</div>
              </CardContent>
            </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                  {
                    appointments.filter((apt) => apt.type === "video_call")
                      .length
                  }
                </div>
                  <div className="text-sm font-semibold text-purple-700">Video Calls</div>
              </CardContent>
            </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                  {
                    appointments.filter((apt) => apt.type === "in_person")
                      .length
                  }
                </div>
                  <div className="text-sm font-semibold text-orange-700">In-Person</div>
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>

          {/* Chat Dialog */}
          <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
            <DialogContent
              className="max-w-2xl p-0 overflow-hidden"
              aria-describedby="chat-desc"
            >
              <DialogHeader className="p-4 border-b">
                <DialogTitle>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeDoctor?.avatar || ""} />
                      <AvatarFallback>
                        {(activeDoctor?.name || "D").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {activeDoctor?.name || "Therapist"}
                      </div>
                      <div className="text-xs text-gray-500">Secure chat</div>
                    </div>
                    <div className="ml-auto">
                      <Button asChild variant="ghost" size="sm">
                        <a href="/dashboard/patient/messages">Open Messages</a>
                      </Button>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <p id="chat-desc" className="sr-only">
                Send messages and attachments to your therapist.
              </p>
              <div className="h-[50vh] flex flex-col">
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatLoading && (
                    <p className="text-sm text-gray-500">
                      Loading conversation...
                    </p>
                  )}
                  {chatError && (
                    <p className="text-sm text-red-600">{chatError}</p>
                  )}
                  {chatMessages.map((m, idx) => {
                    const isMe = m.sender?.uid === uid || m.sender === uid;
                    return (
                      <div
                        key={idx}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            isMe ? "bg-indigo-600 text-white" : "bg-gray-100"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                  <div id="chat-end" />
                </div>
                <div className="border-t p-3 flex items-center gap-2">
                  <Input
                    placeholder="Type a message"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                  />
                  <Input
                    placeholder="Attachment URL (optional)"
                    value={chatAttachmentUrl}
                    onChange={(e) => setChatAttachmentUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleSendChat}
                    disabled={
                      !activeChatId ||
                      (!chatText.trim() && !chatAttachmentUrl.trim())
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-1" /> Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Payment Dialog */}
          <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-gray-800">
                  💳 Secure Payment
                </DialogTitle>
                <DialogDescription className="text-center text-lg text-gray-600">
                  Pay INR {paymentAmount} to confirm your appointment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="text-sm text-gray-600 font-semibold">Choose Payment Method</div>
                <div className="flex gap-3">
                  <Button
                    variant={paymentMethod === "upi" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("upi")}
                    className="flex-1 h-12 text-lg font-semibold"
                  >
                    💳 UPI
                  </Button>
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("card")}
                    className="flex-1 h-12 text-lg font-semibold"
                  >
                    🏦 Card
                  </Button>
                </div>
                {paymentMethod === "upi" ? (
                  <div className="space-y-3">
                    <Label htmlFor="upi" className="text-sm font-semibold text-gray-700">UPI ID</Label>
                    <Input
                      id="upi"
                      placeholder="name@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card" className="text-sm font-semibold text-gray-700">Card Number</Label>
                      <Input
                        id="card"
                        placeholder="4111 1111 1111 1111"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="exp" className="text-sm font-semibold text-gray-700">Expiry (MM/YY)</Label>
                        <Input
                          id="exp"
                          placeholder="12/25"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm font-semibold text-gray-700">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsPaymentOpen(false)}
                    disabled={processingPayment}
                    className="flex-1 h-12 text-lg font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPaymentAndCreate}
                    disabled={processingPayment}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {processingPayment
                      ? "Processing…"
                      : `Pay INR ${paymentAmount}`}
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
