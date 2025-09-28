"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  MessageSquare,
  TrendingUp,
  Home,
  Settings,
  FileText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useRef, useState } from "react";
import { searchDoctors, getDoctors } from "@/lib/api";

export default function PatientNavbar() {
  const pathname = usePathname();
  const { displayName, role } = useAuthStore();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<
    Array<{ id?: string; name: string; specialty?: string }>
  >([]);

  const links = [
    { href: "/dashboard/patient", label: "Dashboard", Icon: Home },
    {
      href: "/dashboard/patient/schedule",
      label: "My Schedule",
      Icon: Calendar,
    },
    {
      href: "/dashboard/patient/progress",
      label: "Progress",
      Icon: TrendingUp,
    },
    {
      href: "/dashboard/patient/messages",
      label: "Messages",
      Icon: MessageSquare,
    },
    {
      href: "/dashboard/patient/notifications",
      label: "Notifications",
      Icon: Bell,
    },
    {
      href: "/dashboard/patient/feedback",
      label: "Feedback",
      Icon: FileText,
    },
  ];

  // Avoid hydration mismatch by deferring client-only UI until mounted
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Track latest request to prevent stale results overwriting newer ones
  const searchSeqRef = useRef(0);

  // Debounced search against real API (fallback to empty)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const seq = ++searchSeqRef.current;
    const id = setTimeout(async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("app_jwt") || undefined
            : undefined;
        let uidFallback: string | undefined;
        if (typeof window !== "undefined") {
          try {
            const authRaw = localStorage.getItem("auth-storage");
            if (authRaw) uidFallback = JSON.parse(authRaw)?.state?.uid;
            if (!uidFallback)
              uidFallback = localStorage.getItem("uid") || undefined;
          } catch {}
        }
        // Backend list endpoint doesn't support free text; fetch allowed doctors then filter client-side
        let data: Record<string, unknown>[] = [];
        const primaryAuth =
          token && token.includes(".") ? token : uidFallback || token || "";
        try {
          data = await getDoctors(primaryAuth);
        } catch (err) {
          // Retry with UID fallback even if a JWT exists
          if (uidFallback && uidFallback !== primaryAuth) {
            try {
              data = await getDoctors(uidFallback);
            } catch (err2) {
              console.warn(
                "Doctor search failed with both JWT and UID auth",
                err2
              );
              data = [];
            }
          } else {
            console.warn("Doctor search failed", err);
            data = [];
          }
        }
        const filtered = (data || []).filter((d: Record<string, unknown>) => {
          if (d.role && String(d.role).toLowerCase() !== "doctor") return false;
          const q = query.toLowerCase();
          const name = (
            d.displayName ||
            d.name ||
            d.fullName ||
            ""
          ).toLowerCase();
          const spec = (
            d.specialty ||
            d.specialisation ||
            d.specialtyName ||
            ""
          ).toLowerCase();
          const email = (d.email || "").toLowerCase();
          const uid = (d.uid || "").toLowerCase();
          return (
            name.includes(q) ||
            spec.includes(q) ||
            email.includes(q) ||
            uid.includes(q)
          );
        });
        const mapped = (filtered || []).map((d: Record<string, unknown>) => {
          let avatar: string | undefined = d.photoURL || d.avatar || d.image;
          if (
            !avatar ||
            (typeof avatar === "string" && avatar.startsWith("/avatars/"))
          ) {
            avatar = "/icon-192.png";
          }
          return {
            id: d._id || d.id,
            name: d.displayName || d.name || "Doctor",
            specialty: d.specialty || d.specialisation || "Doctor",
            avatar,
          };
        });
        if (process.env.NODE_ENV !== "production") {
          console.log("Doctor search results:", {
            total: data?.length || 0,
            filtered: mapped?.length || 0,
          });
          if ((mapped?.length || 0) === 0) {
            console.log(
              "Sample doctor names",
              (data || []).slice(0, 5).map((d: Record<string, unknown>) => ({
                name: d.displayName || d.name,
                email: d.email,
                specialty: d.specialty || d.specialisation,
                uid: d.uid,
              }))
            );
          }
        }
        if (seq === searchSeqRef.current) setResults(mapped);
      } catch (e) {
        if (seq === searchSeqRef.current) setResults([]);
      } finally {
        if (seq === searchSeqRef.current) setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      {/* Top row: full-width search + actions + profile */}
      <div className="px-4 md:px-6 py-3 flex items-center gap-3">
        <Link href="/" className="hidden sm:flex items-center gap-2 group">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="AyurSutra"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-gray-900">Patient</span>
        </Link>

        <div className="flex-1">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search doctors or specialist..."
              className="w-full h-12 rounded-2xl pl-10 pr-4 bg-white/90 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {(results.length > 0 || (query && isSearching)) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-lg overflow-hidden z-50"
              >
                <div className="px-3 py-2 text-xs text-gray-500 border-b bg-white/80 backdrop-blur">
                  {isSearching ? "Searching..." : `Results for "${query}"`}
                </div>
                <div className="max-h-72 overflow-auto">
                  {results.map((r) => (
                    <button
                      key={r.id || r.name}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => {
                        setQuery("");
                        setResults([]);
                        if ((r as any).id)
                          window.location.href = `/dashboard/patient/doctor/${
                            (r as any).id
                          }`;
                      }}
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-indigo-50">
                        <img
                          src={(r as any).avatar || "/icon-192.png"}
                          alt={r.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/icon-192.png";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {r.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {r.specialty || "Doctor"}
                        </div>
                      </div>
                    </button>
                  ))}
                  {!isSearching && results.length === 0 && (
                    <div className="px-4 py-6 text-sm text-gray-500">
                      No results
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications dropdown */}
          {isMounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-2xl bg-white/80 border border-gray-200 shadow-sm hover:shadow transition group">
                  <Bell className="w-5 h-5 m-auto text-gray-600 group-hover:text-indigo-600" />
                  <span className="absolute top-2 right-2 inline-block w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 p-0 overflow-hidden"
              >
                <div className="px-3 py-2 border-b bg-white/80 backdrop-blur">
                  <div className="text-sm font-semibold text-gray-900">
                    Notifications
                  </div>
                  <div className="text-xs text-gray-500">
                    You have 3 updates
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {[
                    {
                      id: 1,
                      title: "Appointment Reminder",
                      desc: "Therapy at 10:00 AM",
                      time: "2h",
                    },
                    {
                      id: 2,
                      title: "Progress Updated",
                      desc: "Shirodhara improvement noted",
                      time: "1d",
                    },
                    {
                      id: 3,
                      title: "New Message",
                      desc: "Therapist sent you a note",
                      time: "2d",
                    },
                  ].map((n) => (
                    <div
                      key={n.id}
                      className="px-3 py-3 hover:bg-gray-50 transition flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {n.title}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {n.desc}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {n.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t bg-white/80">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-indigo-600 hover:text-indigo-700"
                  >
                    View all
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Settings dropdown */}
          {isMounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-2xl bg-white/80 border border-gray-200 shadow-sm hover:shadow transition group">
                  <Settings className="w-5 h-5 m-auto text-gray-600 group-hover:text-indigo-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Theme: Light</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuItem>Privacy</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Profile dropdown */}
          {isMounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-gray-200 shadow-sm px-2 py-1 cursor-pointer">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden">
                    <Image
                      src="/icon-192.png"
                      alt="Profile"
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div className="leading-tight pr-2 hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-[10rem]">
                      {displayName || "Patient"}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {role || "patient"}
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  Signed in as {displayName || "Patient"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-variant="destructive"
                  onClick={() => {
                    try {
                      localStorage.removeItem("app_jwt");
                    } catch {}
                    window.location.href = "/";
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Second row: navigation pane */}
      <div className="px-4 md:px-6 pb-3">
        <nav className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 p-[1px] rounded-xl shadow-sm w-full overflow-hidden">
            <div className="flex items-center gap-1 rounded-[10px] bg-white/80 backdrop-blur px-1 py-1 border border-white/50 overflow-x-auto scrollbar-thin">
              {links.map(({ href, label, Icon }) => {
                const isActive = pathname === href;
                return (
                  <Button
                    key={href}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={
                      "relative group/btn rounded-lg font-medium text-sm transition-all " +
                      (isActive
                        ? "text-indigo-700"
                        : "text-gray-700 hover:text-indigo-700")
                    }
                  >
                    <Link href={href} className="px-3 py-2">
                      <motion.span
                        className="absolute inset-0 rounded-lg bg-indigo-50 opacity-0 group-hover/btn:opacity-100"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon
                          className={
                            "h-4 w-4 " +
                            (isActive
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover/btn:text-indigo-600")
                          }
                        />
                        {label}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="patient-active-underline"
                          className="absolute left-2 right-2 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                        />
                      )}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
