"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  TrendingUp,
  Target,
  Award,
  Clock,
  Star,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getPatientProgress,
  getPatientGoals,
  getPatientAchievements,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Types
interface ProgressData {
  id: string;
  date: string;
  therapy: string;
  therapist: string;
  duration: number;
  rating: number;
  notes: string;
  symptoms: string[];
  improvements: string[];
  painLevel: number;
  energyLevel: number;
  moodLevel: number;
  sleepQuality: number;
  overallWellness: number;
}

interface TherapyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: "active" | "completed" | "paused";
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  points: number;
}

interface ProgressMetrics {
  totalSessions: number;
  averageRating: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  goalsCompleted: number;
  totalGoals: number;
  improvementRate: number;
}

// Mock data
const mockProgressData: ProgressData[] = [
  {
    id: "1",
    date: "2025-09-08",
    therapy: "Abhyanga (Oil Massage)",
    therapist: "Dr. Sarah Johnson",
    duration: 60,
    rating: 4.5,
    notes: "Excellent session. Felt very relaxed and rejuvenated.",
    symptoms: ["Stress", "Muscle Tension"],
    improvements: ["Better Sleep", "Reduced Anxiety"],
    painLevel: 2,
    energyLevel: 8,
    moodLevel: 9,
    sleepQuality: 8,
    overallWellness: 8.5,
  },
  {
    id: "2",
    date: "2025-09-05",
    therapy: "Shirodhara (Oil Pouring)",
    therapist: "Dr. Michael Chen",
    duration: 45,
    rating: 4.8,
    notes: "Amazing experience. Very calming and therapeutic.",
    symptoms: ["Headaches", "Insomnia"],
    improvements: ["Better Focus", "Deep Relaxation"],
    painLevel: 1,
    energyLevel: 7,
    moodLevel: 8,
    sleepQuality: 9,
    overallWellness: 8.2,
  },
  {
    id: "3",
    date: "2025-09-01",
    therapy: "Panchakarma (Detox)",
    therapist: "Dr. Priya Sharma",
    duration: 90,
    rating: 4.2,
    notes: "Intensive session but very beneficial for overall health.",
    symptoms: ["Digestive Issues", "Fatigue"],
    improvements: ["Better Digestion", "Increased Energy"],
    painLevel: 3,
    energyLevel: 6,
    moodLevel: 7,
    sleepQuality: 7,
    overallWellness: 7.5,
  },
];

const mockGoals: TherapyGoal[] = [
  {
    id: "1",
    title: "Reduce Chronic Back Pain",
    description:
      "Achieve 50% reduction in back pain through regular therapy sessions",
    targetDate: "2025-12-31",
    progress: 65,
    status: "active",
    category: "Pain Management",
  },
  {
    id: "2",
    title: "Improve Sleep Quality",
    description:
      "Maintain consistent 8-hour sleep schedule with better quality",
    targetDate: "2025-11-15",
    progress: 80,
    status: "active",
    category: "Sleep Health",
  },
  {
    id: "3",
    title: "Reduce Stress Levels",
    description: "Lower stress levels by 40% through mindfulness and therapy",
    targetDate: "2025-10-30",
    progress: 100,
    status: "completed",
    category: "Mental Health",
  },
];

const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "First Session Complete",
    description: "Completed your first therapy session",
    icon: "🎉",
    date: "2025-08-15",
    points: 10,
  },
  {
    id: "2",
    title: "Consistency Champion",
    description: "Attended 5 consecutive sessions",
    icon: "🏆",
    date: "2025-09-01",
    points: 25,
  },
  {
    id: "3",
    title: "Goal Achiever",
    description: "Completed your first therapy goal",
    icon: "🎯",
    date: "2025-09-05",
    points: 50,
  },
];

export default function PatientProgressPage() {
  const { user, token } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [goals, setGoals] = useState<TherapyGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("3months");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetDate: "",
    category: "",
  });

  const loadProgressData = useCallback(async () => {
    if (!user?.uid || !token) return;

    setIsLoading(true);
    try {
      const [progressResponse, goalsResponse, achievementsResponse] =
        await Promise.all([
          getPatientProgress(user.uid, token),
          getPatientGoals(user.uid, token),
          getPatientAchievements(user.uid, token),
        ]);

      // Transform progress data to match our interface
      const transformedProgressData =
        progressResponse.recentSessions?.map(
          (session: {
            id: string;
            date: string;
            therapy: string;
            therapist: string;
            duration: number;
            rating: number;
            notes: string;
            painLevel: number;
            energyLevel: number;
            moodLevel: number;
            sleepQuality: number;
            overallWellness: number;
          }) => ({
            id: session.id,
            date: session.date,
            therapy: session.therapy,
            therapist: session.therapist,
            duration: session.duration,
            rating: session.rating,
            notes: session.notes,
            symptoms: [],
            improvements: [],
            painLevel: session.painLevel,
            energyLevel: session.energyLevel,
            moodLevel: session.moodLevel,
            sleepQuality: session.sleepQuality,
            overallWellness: session.overallWellness,
          })
        ) || [];

      setProgressData(transformedProgressData);
      setGoals(goalsResponse || []);
      setAchievements(achievementsResponse || []);
    } catch (error) {
      console.error("Error loading progress data:", error);
      toast.error("Failed to load progress data");
      // Fallback to mock data
      setProgressData(mockProgressData);
      setGoals(mockGoals);
      setAchievements(mockAchievements);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, token]);

  // Load data on component mount
  useEffect(() => {
    if (user?.uid && token) {
      loadProgressData();
    }
  }, [user?.uid, token, loadProgressData]);

  // Calculate metrics
  const metrics: ProgressMetrics = {
    totalSessions: progressData.length,
    averageRating:
      progressData.reduce((sum, session) => sum + session.rating, 0) /
      progressData.length,
    totalDuration: progressData.reduce(
      (sum, session) => sum + session.duration,
      0
    ),
    currentStreak: 3,
    longestStreak: 5,
    goalsCompleted: goals.filter((goal) => goal.status === "completed").length,
    totalGoals: goals.length,
    improvementRate: 15.2,
  };

  // Chart data
  const wellnessTrendData = progressData
    .map((session) => ({
      date: new Date(session.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      wellness: session.overallWellness,
      pain: session.painLevel,
      energy: session.energyLevel,
      mood: session.moodLevel,
      sleep: session.sleepQuality,
    }))
    .reverse();

  const therapyDistributionData = progressData.reduce((acc, session) => {
    const existing = acc.find((item) => item.therapy === session.therapy);
    if (existing) {
      existing.sessions += 1;
    } else {
      acc.push({ therapy: session.therapy, sessions: 1 });
    }
    return acc;
  }, [] as { therapy: string; sessions: number }[]);

  const monthlyProgressData = [
    { month: "Jun", sessions: 2, rating: 4.2, wellness: 7.0 },
    { month: "Jul", sessions: 4, rating: 4.4, wellness: 7.5 },
    { month: "Aug", sessions: 6, rating: 4.6, wellness: 8.0 },
    { month: "Sep", sessions: 3, rating: 4.5, wellness: 8.2 },
  ];

  const handleAddGoal = () => {
    if (
      !newGoal.title ||
      !newGoal.description ||
      !newGoal.targetDate ||
      !newGoal.category
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const goal: TherapyGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      progress: 0,
      status: "active",
      category: newGoal.category,
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: "", description: "", targetDate: "", category: "" });
    toast.success("Goal added successfully!");
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(progressData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "therapy-progress-data.json";
    link.click();
    toast.success("Data exported successfully!");
  };

  const handleShareProgress = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Therapy Progress",
        text: `I've completed ${
          metrics.totalSessions
        } therapy sessions with an average rating of ${metrics.averageRating.toFixed(
          1
        )}/5!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Progress link copied to clipboard!");
    }
  };

  const refreshData = () => {
    loadProgressData();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
          <p className="text-gray-600 mt-1">
            Track your therapy journey and wellness improvements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleShareProgress}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.totalSessions}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.averageRating.toFixed(1)}/5
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.currentStreak} days
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Goals Completed
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.goalsCompleted}/{metrics.totalGoals}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{session.therapy}</h4>
                        <p className="text-sm text-gray-600">
                          {session.therapist}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{session.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {session.duration}min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wellness Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Wellness Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Wellness</span>
                      <span>{progressData[0]?.overallWellness || 0}/10</span>
                    </div>
                    <Progress
                      value={(progressData[0]?.overallWellness || 0) * 10}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Energy Level</span>
                      <span>{progressData[0]?.energyLevel || 0}/10</span>
                    </div>
                    <Progress
                      value={(progressData[0]?.energyLevel || 0) * 10}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mood Level</span>
                      <span>{progressData[0]?.moodLevel || 0}/10</span>
                    </div>
                    <Progress
                      value={(progressData[0]?.moodLevel || 0) * 10}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sleep Quality</span>
                      <span>{progressData[0]?.sleepQuality || 0}/10</span>
                    </div>
                    <Progress
                      value={(progressData[0]?.sleepQuality || 0) * 10}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.totalDuration}
                </div>
                <div className="text-sm text-gray-600">Total Minutes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {metrics.improvementRate}%
                </div>
                <div className="text-sm text-gray-600">Improvement Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {metrics.longestStreak}
                </div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Select
              value={selectedTimeframe}
              onValueChange={setSelectedTimeframe}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Therapies</SelectItem>
                <SelectItem value="massage">Massage</SelectItem>
                <SelectItem value="detox">Detox</SelectItem>
                <SelectItem value="relaxation">Relaxation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wellness Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Wellness Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={wellnessTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="wellness"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Therapy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Therapy Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={therapyDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ therapy, percent }) =>
                        `${therapy} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {therapyDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${index * 60}, 70%, 50%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#8884d8" />
                    <Bar dataKey="rating" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pain vs Energy */}
            <Card>
              <CardHeader>
                <CardTitle>Pain vs Energy Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={wellnessTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="pain"
                      stackId="1"
                      stroke="#ff6b6b"
                      fill="#ff6b6b"
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stackId="2"
                      stroke="#4ecdc4"
                      fill="#4ecdc4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Therapy Goals</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Therapy Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, title: e.target.value })
                      }
                      placeholder="e.g., Reduce chronic back pain"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, description: e.target.value })
                      }
                      placeholder="Describe your goal in detail..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, targetDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) =>
                        setNewGoal({ ...newGoal, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pain Management">
                          Pain Management
                        </SelectItem>
                        <SelectItem value="Mental Health">
                          Mental Health
                        </SelectItem>
                        <SelectItem value="Sleep Health">
                          Sleep Health
                        </SelectItem>
                        <SelectItem value="Physical Fitness">
                          Physical Fitness
                        </SelectItem>
                        <SelectItem value="Stress Relief">
                          Stress Relief
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">
                    Add Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge
                      variant={
                        goal.status === "completed"
                          ? "default"
                          : goal.status === "active"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {goal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Category: {goal.category}</span>
                      <span>
                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Your Achievements</h2>
            <p className="text-gray-600">
              Celebrate your therapy journey milestones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{achievement.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {achievement.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                    <Badge variant="secondary">+{achievement.points} pts</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Points Earned</span>
                  <span className="font-bold">
                    {achievements.reduce((sum, a) => sum + a.points, 0)} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Achievements Unlocked</span>
                  <span className="font-bold">{achievements.length}/10</span>
                </div>
                <Progress
                  value={(achievements.length / 10) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
