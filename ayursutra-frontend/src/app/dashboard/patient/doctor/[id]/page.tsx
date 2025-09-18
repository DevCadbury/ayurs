"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  getAvailableTimeSlots,
  createAppointment,
  getDoctorById,
  getDoctorReviews,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DoctorProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const doctorId = params?.id;
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  type SlotItem = {
    id: string;
    label: string;
    startTime: string;
    endTime: string;
  };
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [therapyId, setTherapyId] = useState<string>("");
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("app_jwt") || undefined
      : undefined;
  const patientId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const authRaw = localStorage.getItem("auth-storage");
            if (authRaw) {
              const parsed = JSON.parse(authRaw);
              const uid = parsed?.state?.uid;
              if (uid) return uid as string;
            }
          } catch {}
          const direct = localStorage.getItem("uid");
          if (direct) return direct;
          // Fallback: decode app_jwt payload
          try {
            const jwt = localStorage.getItem("app_jwt");
            if (jwt && jwt.split(".").length === 3) {
              const payload = JSON.parse(atob(jwt.split(".")[1]));
              if (payload?.uid) return payload.uid as string;
            }
          } catch {}
          return "";
        })()
      : "";

  function toIso(dateStr: string, timeStr: string) {
    if (!dateStr || !timeStr) return new Date(NaN).toISOString();
    let t = timeStr.trim();
    // Normalize "HH:MM" or "HH:MM AM/PM"
    let hours = 0;
    let minutes = 0;
    const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const twentyFourMatch = t.match(/^(\d{1,2}):(\d{2})$/);
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = parseInt(ampmMatch[2], 10);
      const isPm = ampmMatch[3].toUpperCase() === "PM";
      if (hours === 12) hours = 0;
      if (isPm) hours += 12;
    } else if (twentyFourMatch) {
      hours = parseInt(twentyFourMatch[1], 10);
      minutes = parseInt(twentyFourMatch[2], 10);
    } else if (/^\d{1,2}$/.test(t)) {
      hours = parseInt(t, 10);
    } else {
      // If times include a range like "10:00-11:00" or en/em dash, pick first part without recursion
      const parts = t.split(/[-–—]/);
      const first = parts[0]?.trim();
      if (first && first !== t) {
        t = first;
        const am = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        const tf = t.match(/^(\d{1,2}):(\d{2})$/);
        if (am) {
          hours = parseInt(am[1], 10);
          minutes = parseInt(am[2], 10);
          const isPm2 = am[3].toUpperCase() === "PM";
          if (hours === 12) hours = 0;
          if (isPm2) hours += 12;
        } else if (tf) {
          hours = parseInt(tf[1], 10);
          minutes = parseInt(tf[2], 10);
        } else if (/^\d{1,2}$/.test(t)) {
          hours = parseInt(t, 10);
        } else {
          hours = 0;
          minutes = 0;
        }
      } else {
        hours = 0;
        minutes = 0;
      }
    }
    const d = new Date(dateStr);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!doctorId) return;
        let doc: Record<string, unknown> | null = null;
        let rev: Record<string, unknown>[] = [];
        // Prefer allowed list then fallback to search; avoid restricted /users/:id
        try {
          const { getDoctors } = await import("@/lib/api");
          const authHeader =
            token && token.includes(".") ? token : patientId || token || "";
          const list = await getDoctors(authHeader);
          doc =
            (list || []).find(
              (d: Record<string, unknown>) => (d._id || d.id) === doctorId
            ) || null;
        } catch {}
        if (!doc) {
          try {
            const { searchDoctors } = await import("@/lib/api");
            const tokenLocal =
              typeof window !== "undefined"
                ? localStorage.getItem("app_jwt") || undefined
                : undefined;
            const results = await searchDoctors(
              String(doctorId),
              tokenLocal,
              patientId
            );
            doc =
              (results || []).find(
                (d: Record<string, unknown>) => (d._id || d.id) === doctorId
              ) ||
              (results || [])[0] ||
              null;
          } catch {}
        }
        try {
          rev = await getDoctorReviews(doctorId, token, patientId);
        } catch {}
        if (!mounted) return;
        setDoctor(doc);
        setReviews(rev || []);
        try {
          const { getTherapies } = await import("@/lib/api");
          const therapies = await getTherapies(token || "");
          const match = Array.isArray(therapies)
            ? therapies.find((t: Record<string, unknown>) =>
                (t.name || "")
                  .toLowerCase()
                  .includes(
                    (doc?.specialty || doc?.specialisation || "").toLowerCase()
                  )
              )
            : null;
          setTherapyId(match?._id || therapies?.[0]?._id || "");
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [doctorId]);

  useEffect(() => {
    async function loadSlots() {
      if (!doctorId || !date) return;
      try {
        const res = await getAvailableTimeSlots(doctorId, date, token || "");
        const raw = (res?.slots || res || []) as any[];
        const normalized: SlotItem[] = raw.map((s, idx) => {
          if (typeof s === "string") {
            const [start, end] = s.split("-");
            return {
              id: `${date}-${start}-${end}-${idx}`,
              label: s,
              startTime: start,
              endTime: end,
            };
          }
          const start = s.startTime || s.start || s.from || s[0];
          const end = s.endTime || s.end || s.to || s[1];
          const label = s.displayTime || s.label || `${start}-${end}`;
          return {
            id: `${date}-${start}-${end}-${idx}`,
            label,
            startTime: start,
            endTime: end,
          };
        });
        setSlots(normalized);
      } catch (e) {
        setSlots([]);
      }
    }
    loadSlots();
  }, [doctorId, date]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    const start = selectedSlot.startTime;
    const end = selectedSlot.endTime;
    const startIso = start && start.includes("T") ? start : toIso(date, start);
    const endIso = end && end.includes("T") ? end : toIso(date, end);
    let effectiveTherapyId = therapyId;
    if (!effectiveTherapyId) {
      try {
        const { getTherapies } = await import("@/lib/api");
        const therapies = await getTherapies(token || "");
        effectiveTherapyId = therapies?.[0]?._id || "";
      } catch {}
    }
    if (!effectiveTherapyId) {
      if (typeof window !== "undefined") {
        alert("Unable to determine therapy. Please try again later.");
      }
      return;
    }
    const payload = {
      patient: patientId,
      doctor: (doctorId as string) || "",
      therapy: effectiveTherapyId,
      startTime: startIso,
      endTime: endIso,
      notes: `Booking with ${doctor?.displayName}`,
    };
    if (
      !payload.patient ||
      !payload.doctor ||
      !payload.therapy ||
      !payload.startTime ||
      !payload.endTime
    ) {
      console.error("Missing field in booking payload", payload);
      if (typeof window !== "undefined") {
        alert("Missing required booking details. Please try again.");
      }
      return;
    }
    try {
      console.log("Creating appointment with payload:", payload);
      await createAppointment(payload, token || "");
      router.push("/dashboard/patient/schedule");
    } catch (err: unknown) {
      console.error("Failed to create appointment:", err);
      if (typeof window !== "undefined") {
        alert((err as Error)?.message || "Failed to create appointment");
      }
    }
  };

  if (loading) return <div className="px-6 py-8">Loading...</div>;
  if (!doctor) return <div className="px-6 py-8">Doctor not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow bg-gray-100">
          <Image
            src={doctor.photoURL || "/icon-192.png"}
            alt={doctor.displayName || doctor.name || "Doctor photo"}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {doctor.displayName || doctor.name}
          </h1>
          <p className="text-gray-600">
            {doctor.specialty || doctor.specialisation || "Doctor"}
          </p>
          {doctor.bio && (
            <p className="mt-2 text-gray-700 max-w-3xl">{doctor.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">About</h2>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              {doctor.bio ||
                "Experienced Ayurvedic specialist providing patient-centered care and holistic therapies."}
            </p>
          </div>

          <h2 className="font-semibold text-gray-900 mt-4">Reviews</h2>
          <div className="rounded-xl border bg-white divide-y">
            {reviews.length === 0 && (
              <div className="p-4 text-gray-500">No reviews yet.</div>
            )}
            {reviews.map((r) => (
              <div key={r._id} className="p-4 flex gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={r.patient?.photoURL || "/icon-192.png"}
                    alt={r.patient?.displayName || "Patient"}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {r.patient?.displayName || "Patient"}
                  </div>
                  <div className="text-sm text-gray-700">
                    {r.comment || "No comment provided."}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Rating: {r.rating}/5{" "}
                    {r.createdAt
                      ? `• ${new Date(r.createdAt).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Book an appointment</h2>
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
            <label className="block text-sm text-gray-700">Select date</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <label className="block text-sm text-gray-700">
              Available time
            </label>
            <div className="flex flex-wrap gap-2">
              {slots.length === 0 && (
                <div className="text-sm text-gray-500">
                  No slots for selected date.
                </div>
              )}
              {slots.map((s) => (
                <button
                  key={s.id}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    selectedSlot?.id === s.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedSlot(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={!selectedSlot}>
                  Proceed to payment
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="payment-summary">
                <DialogHeader>
                  <DialogTitle>Payment</DialogTitle>
                </DialogHeader>
                <div id="payment-summary" className="space-y-3">
                  <div className="text-sm text-gray-700">
                    Doctor:{" "}
                    <span className="font-medium">{doctor.displayName}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Date: <span className="font-medium">{date}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Time:{" "}
                    <span className="font-medium">{selectedSlot?.label}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Amount: <span className="font-medium">₹1,200.00</span>
                  </div>
                  <div className="rounded-lg border p-3 text-sm text-gray-600 bg-gray-50">
                    This is a mock payment for demo purposes.
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleBook} className="w-full">
                    Pay & Book
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
