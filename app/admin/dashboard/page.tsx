"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, TrendingUp, AlertCircle } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { apiClient, type DashboardStats } from "@/lib/api"
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: stats, loading, error } = useApi<DashboardStats>(
    () => (isClient ? apiClient.getDashboardStats() : Promise.resolve({} as DashboardStats)),
    [isClient]
  );

  if (!isClient || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Students",
      value: stats?.totalStudents?.toString() || "0",
      icon: Users,
      change: "+12%",
    },
    {
      title: "Pending Queries",
      value: stats?.totalQueriesOpen?.toString() || "0",
      icon: MessageSquare,
      change: "-5%",
    },
    {
      title: "Bonafide Requests",
      value: stats?.totalBonafideRequestsPending?.toString() || "0",
      icon: FileText,
      change: "+3%",
    },
    {
      title: "Total Subjects",
      value: stats?.totalSubjects?.toString() || "0",
      icon: TrendingUp,
      change: "+18%",
    },
  ]

  const recentActivities = [
    { action: "New query submitted", student: "John Doe", subject: "Mathematics", time: "2 hours ago" },
    { action: "Bonafide request approved", student: "Jane Smith", purpose: "Scholarship", time: "4 hours ago" },
    { action: "Marks uploaded", subject: "Physics - Semester 6", count: "45 students", time: "6 hours ago" },
    { action: "Query resolved", student: "Mike Johnson", subject: "Chemistry", time: "1 day ago" },
  ]

  const pendingTasks = [
    { task: "Review bonafide requests", count: stats?.totalBonafideRequestsPending || 0, priority: "high" },
    { task: "Respond to student queries", count: stats?.totalQueriesOpen || 0, priority: "medium" },
    { task: "Upload semester results", count: 3, priority: "high" },
    { task: "Generate academic reports", count: 2, priority: "low" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of examination cell activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">
                      {activity.student && `${activity.student} • `}
                      {activity.subject && `${activity.subject} • `}
                      {activity.purpose && `${activity.purpose} • `}
                      {activity.count && `${activity.count} • `}
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle
                      className={`h-4 w-4 ${
                        task.priority === "high"
                          ? "text-red-500"
                          : task.priority === "medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{task.task}</p>
                      <p className="text-xs text-gray-600">{task.count} items</p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
