"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Star,
  ClipboardList,
  Calendar,
  User,
  Stethoscope,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getPatientAppointments, updateSessionFeedback } from "@/lib/api";

interface AppointmentItem {
  _id: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  rating?: number;
  painLevel?: number;
  energyLevel?: number;
  moodLevel?: number;
  sleepQuality?: number;
  overallWellness?: number;
  duration?: number;
  patient: { _id: string; name?: string } | string;
  doctor: { _id: string; name?: string } | string;
  therapy: { _id: string; name?: string } | string;
}

export default function PatientFeedbackPage() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppointmentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const completedSessions = useMemo(
    () => appointments.filter((a) => a.status === "completed"),
    [appointments]
  );

  async function loadAppointments() {
    if (!user?.uid || !token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getPatientAppointments(user.uid, token);
      setAppointments(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load sessions");
      toast.error((err as Error)?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, token]);

  async function submitFeedback() {
    if (!selected || !token || !user?.uid) return;
    setSubmitting(true);
    try {
      await updateSessionFeedback(
        selected._id,
        {
          rating: selected.rating,
          notes: selected.notes,
          painLevel: selected.painLevel,
          energyLevel: selected.energyLevel,
          moodLevel: selected.moodLevel,
          sleepQuality: selected.sleepQuality,
          overallWellness: selected.overallWellness,
        },
        token,
        user.uid
      );
      toast.success("Feedback saved");
      setSelected(null);
      await loadAppointments();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to save feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-xl border bg-white"
          >
            <div className="p-5 md:p-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Therapy Feedback</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Review completed sessions and share your experience.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAppointments}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-indigo-600" />{" "}
                  Completed Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && (
                  <p className="text-sm text-gray-500">Loading sessions...</p>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
                {!loading && completedSessions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No completed sessions yet.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {completedSessions.map((apt) => {
                    const therapyName =
                      typeof apt.therapy === "string"
                        ? "Therapy"
                        : (apt.therapy as any)?.name || "Therapy";
                    const doctorName =
                      typeof apt.doctor === "string"
                        ? "Therapist"
                        : (apt.doctor as any)?.name || "Therapist";
                    return (
                      <motion.div
                        key={apt._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Card className="rounded-xl hover:shadow-md transition-colors border hover:bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>
                                    {new Date(apt.startTime).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Stethoscope className="h-4 w-4 mr-1" />
                                  <span>{therapyName}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="h-4 w-4 mr-1" />
                                  <span>{doctorName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="rounded-md"
                                >
                                  Rating: {apt.rating ?? "-"}
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => setSelected(apt)}
                                >
                                  Give Feedback
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Dialog
            open={!!selected}
            onOpenChange={(open) => !open && setSelected(null)}
          >
            <DialogContent
              className="max-w-2xl rounded-xl"
              aria-describedby="feedback-desc"
            >
              <DialogHeader>
                <DialogTitle>Session Feedback</DialogTitle>
              </DialogHeader>
              <p id="feedback-desc" className="sr-only">
                Provide your session rating and wellbeing metrics.
              </p>
              {selected ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Overall Rating (1-5)</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Select
                          value={String(selected.rating ?? "")}
                          onValueChange={(v) =>
                            setSelected({
                              ...selected,
                              rating: v ? Number(v) : undefined,
                            })
                          }
                        >
                          <SelectTrigger className="w-32 rounded-lg">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 mr-2 text-yellow-500" />{" "}
                                  {n}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      className="mt-2 rounded-lg"
                      value={selected.notes ?? ""}
                      onChange={(e) =>
                        setSelected({ ...selected, notes: e.target.value })
                      }
                      placeholder="How was your experience? Any observations or suggestions?"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Pain Level (0-10)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.painLevel ?? ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            painLevel:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <Label>Energy Level (0-10)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.energyLevel ?? ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            energyLevel:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <Label>Mood Level (0-10)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.moodLevel ?? ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            moodLevel:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <Label>Sleep Quality (0-10)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.sleepQuality ?? ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            sleepQuality:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <Label>Overall Wellness (0-10)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.overallWellness ?? ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            overallWellness:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelected(null)}
                      disabled={submitting}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitFeedback}
                      disabled={submitting}
                      className="rounded-lg"
                    >
                      {submitting ? "Saving..." : "Save Feedback"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
