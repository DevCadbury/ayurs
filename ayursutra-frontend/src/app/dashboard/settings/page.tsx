"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function SettingsPage() {
  const { uid, role, displayName, email } = useAuthStore();
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      appointmentReminders: true,
      progressUpdates: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: "private",
      dataSharing: false,
      analytics: true,
    },
    appearance: {
      theme: "light",
      language: "en",
      fontSize: "medium",
    },
    audio: {
      soundEffects: true,
      volume: 70,
    },
    network: {
      offlineMode: false,
      syncFrequency: "realtime",
    },
  });

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving settings:", settings);
  };

  return (
    <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Customize your experience and preferences
              </p>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive push notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              push: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive SMS notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              sms: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Appointment Reminders</Label>
                        <p className="text-sm text-gray-500">
                          Get reminded about upcoming appointments
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.appointmentReminders}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              appointmentReminders: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and data sharing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              profileVisibility: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-gray-500">
                          Allow data sharing for research
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              dataSharing: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Analytics</Label>
                        <p className="text-sm text-gray-500">
                          Help improve the app with usage analytics
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              analytics: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={
                            settings.appearance.theme === "light"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                theme: "light",
                              },
                            })
                          }
                        >
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </Button>
                        <Button
                          variant={
                            settings.appearance.theme === "dark"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                theme: "dark",
                              },
                            })
                          }
                        >
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              language: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <select
                        value={settings.appearance.fontSize}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              fontSize: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Audio & Network */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="h-5 w-5 mr-2" />
                    Audio & Network
                  </CardTitle>
                  <CardDescription>
                    Configure audio and network settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sound Effects</Label>
                        <p className="text-sm text-gray-500">
                          Play sound effects for interactions
                        </p>
                      </div>
                      <Switch
                        checked={settings.audio.soundEffects}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            audio: { ...settings.audio, soundEffects: checked },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Volume</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.audio.volume}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            audio: {
                              ...settings.audio,
                              volume: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0%</span>
                        <span>{settings.audio.volume}%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Offline Mode</Label>
                        <p className="text-sm text-gray-500">
                          Work without internet connection
                        </p>
                      </div>
                      <Switch
                        checked={settings.network.offlineMode}
                        onCheckedChange={(checked: boolean) =>
                          setSettings({
                            ...settings,
                            network: {
                              ...settings.network,
                              offlineMode: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
