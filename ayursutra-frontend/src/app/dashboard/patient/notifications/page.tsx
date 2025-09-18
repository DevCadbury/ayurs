"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getPatientNotifications } from "@/lib/api";

export default function PatientNotificationsPage() {
  const { user, token } = useAuth();
  const [pre, setPre] = useState<
    Array<{ title: string; message: string; type: string }>
  >([]);
  const [post, setPost] = useState<
    Array<{ title: string; message: string; type: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications() {
    if (!user?.uid || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPatientNotifications(user.uid, token);
      setPre(data.pre || []);
      setPost(data.post || []);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, token]);

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              disabled={loading}
            >
              Reload
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Tabs defaultValue="pre">
            <TabsList>
              <TabsTrigger value="pre">Pre-Therapy</TabsTrigger>
              <TabsTrigger value="post">Post-Therapy</TabsTrigger>
            </TabsList>

            <TabsContent value="pre">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-indigo-600" /> Upcoming
                    Session Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading && (
                    <p className="text-sm text-gray-500">Loading...</p>
                  )}
                  {!loading && pre.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No pre-therapy notifications.
                    </p>
                  )}
                  {pre.map((n, idx) => (
                    <div key={idx} className="p-3 border rounded-md bg-white">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{n.title}</div>
                        <Badge variant="secondary" className="uppercase">
                          {n.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="post">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />{" "}
                    After-Session Care & Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading && (
                    <p className="text-sm text-gray-500">Loading...</p>
                  )}
                  {!loading && post.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No post-therapy notifications.
                    </p>
                  )}
                  {post.map((n, idx) => (
                    <div key={idx} className="p-3 border rounded-md bg-white">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{n.title}</div>
                        <Badge variant="secondary" className="uppercase">
                          {n.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
