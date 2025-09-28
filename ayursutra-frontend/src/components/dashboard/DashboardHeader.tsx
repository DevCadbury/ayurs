"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Bell, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import LoginForm from "@/components/auth/LoginForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import {
  getPatientNotifications,
  getDoctors,
  approveUser,
  deleteUserAdmin,
} from "@/lib/api";
import { toast } from "sonner";

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: string;
}

interface DashboardHeaderProps {
  onMenuClick: () => void;
  user: User | null;
  onLogout: () => void;
  getRoleColor: (role: string) => string;
  getRoleLabel: (role: string) => string;
}

export default function DashboardHeader({
  onMenuClick,
  user,
  onLogout,
  getRoleColor,
  getRoleLabel,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { user: authUser, token } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [preNotifs, setPreNotifs] = useState<
    Array<{ title: string; message: string; type: string }>
  >([]);
  const [postNotifs, setPostNotifs] = useState<
    Array<{ title: string; message: string; type: string }>
  >([]);
  const notifCount = (preNotifs?.length || 0) + (postNotifs?.length || 0);
  const [adminNotifCount, setAdminNotifCount] = useState(0);
  const [adminNotifOpen, setAdminNotifOpen] = useState(false);
  const [adminPending, setAdminPending] = useState<any[]>([]);

  async function loadNotifications() {
    try {
      if (!authUser?.uid || !token) return;
      const data = await getPatientNotifications(authUser.uid, token);
      setPreNotifs(data.pre || []);
      setPostNotifs(data.post || []);
    } catch (e) {
      // ignore in header
    }
  }

  async function loadAdminNotifCount() {
    try {
      if (!token) return;
      const docs = await getDoctors(token);
      const pendingList = (docs || []).filter(
        (d: Record<string, unknown>) => d.role === "doctor" && d.isApproved === false
      );
      setAdminNotifCount(pendingList.length);
      setAdminPending(pendingList);
    } catch {}
  }

  return (
    <header className="px-4 py-3 border-b bg-background">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {user?.uid ? (
            <>
              {/* Notifications (hidden for admin, handled in admin page toolbar) */}
              {user?.role !== "admin" && (
                <Dialog open={notifOpen} onOpenChange={(o) => setNotifOpen(o)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    onClick={() => {
                      setNotifOpen(true);
                      loadNotifications();
                    }}
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {!!notifCount && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {notifCount}
                      </Badge>
                    )}
                  </Button>
                  <DialogContent
                    className="max-w-lg"
                    aria-describedby="notifications-desc"
                  >
                    <DialogHeader>
                      <DialogTitle>Notifications</DialogTitle>
                    </DialogHeader>
                    <p id="notifications-desc" className="sr-only">
                      Your pre-therapy and post-therapy notifications.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold mb-2">
                          Pre-Therapy
                        </div>
                        {preNotifs.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No pre-therapy notifications.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {preNotifs.slice(0, 5).map((n, i) => (
                              <div
                                key={`pre-${i}`}
                                className="p-3 border rounded-md bg-white"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-sm">
                                    {n.title}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="uppercase"
                                  >
                                    {n.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {n.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-2">
                          Post-Therapy
                        </div>
                        {postNotifs.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No post-therapy notifications.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {postNotifs.slice(0, 5).map((n, i) => (
                              <div
                                key={`post-${i}`}
                                className="p-3 border rounded-md bg-white"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-sm">
                                    {n.title}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="uppercase"
                                  >
                                    {n.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {n.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setNotifOpen(false)}
                        >
                          Close
                        </Button>
                        <Button asChild>
                          <a href="/dashboard/patient/notifications">
                            View all
                          </a>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {user?.role === "admin" && (
                <Dialog open={adminNotifOpen} onOpenChange={setAdminNotifOpen}>
                  <Button
                    variant="outline"
                    className="relative h-9 px-4"
                    aria-label="Open notifications"
                    onClick={() => {
                      setAdminNotifOpen(true);
                      loadAdminNotifCount();
                    }}
                  >
                    <Bell className="w-4 h-4" />
                    {!!adminNotifCount && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                        {adminNotifCount}
                      </span>
                    )}
                  </Button>
                  <DialogContent className="max-w-md p-4">
                    <DialogHeader>
                      <DialogTitle>Admin Notifications</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="text-sm font-semibold">
                        Pending Approvals
                      </div>
                      {adminPending.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No pending approvals.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-auto pr-1">
                          {adminPending.slice(0, 10).map((d: Record<string, unknown>) => (
                            <div
                              key={String(d._id || d.uid || d.email)}
                              className="p-3 border rounded-md"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">
                                    {d.name || d.displayName || d.email}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {d.email}
                                  </div>
                                </div>
                                <Badge variant="secondary">doctor</Badge>
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={async () => {
                                    try {
                                      if (!token) return;
                                      await approveUser(
                                        String(d._id || d.id || d.uid),
                                        token as any
                                      );
                                      toast.success("Approved");
                                      await loadAdminNotifCount();
                                    } catch {
                                      toast.error("Failed to approve");
                                    }
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      if (!token) return;
                                      await deleteUserAdmin(
                                        String(d._id || d.id || d.uid),
                                        token as any
                                      );
                                      toast.success("Rejected");
                                      await loadAdminNotifCount();
                                    } catch {
                                      toast.error("Failed to reject");
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
                      <div className="text-xs text-gray-500">
                        Pending: {adminNotifCount}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.displayName || "User"} />
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        {user?.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.displayName || "User"}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </p>
                      <Badge className={getRoleColor(user?.role || "patient")}>
                        {getRoleLabel(user?.role || "patient")}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/dashboard/profile" className="cursor-pointer">
                      Profile
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/dashboard/settings" className="cursor-pointer">
                      Settings
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Login Button */
            <Button
              onClick={() => setShowLoginForm(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Login Form Dialog */}
      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
    </header>
  );
}
