"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, FileText, Calculator, MessageSquare, Award, Menu, LogOut, User } from "lucide-react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const navigation = [
	{ name: "Dashboard", href: "/student/dashboard", icon: Home },
	{ name: "Results", href: "/student/results", icon: FileText },
	{ name: "CGPA Calculator", href: "/student/cgpa-calculator", icon: Calculator },
	{ name: "Bonafide Certificate", href: "/student/bonafide", icon: Award },
	{ name: "Queries", href: "/student/queries", icon: MessageSquare },
]

export default function StudentLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const router = useRouter()
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [studentName, setStudentName] = useState("Student")

	const handleLogout = () => {
		localStorage.removeItem("user")
		router.push("/")
	}

	const Sidebar = ({ mobile = false }) => (
		<div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}>
			<div className="flex items-center gap-2 p-6 border-b">
				<User className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="font-semibold">Student Portal</h2>
					<p className="text-sm text-gray-600">{studentName}</p>
				</div>
			</div>

			<nav className="flex-1 p-4 space-y-2">
				{navigation.map((item) => {
					const isActive = pathname === item.href
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
								isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
							}`}
							onClick={() => mobile && setSidebarOpen(false)}
						>
							<item.icon className="h-5 w-5" />
							{item.name}
						</Link>
					)
				})}
			</nav>

			<div className="p-4 border-t">
				<Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
					<LogOut className="h-4 w-4 mr-2" />
					Logout
				</Button>
			</div>
		</div>
	)

	return (
		<ProtectedRoute allowedRoles={["STUDENT"]}>
			<div className="flex h-screen bg-gray-50">
				{/* Desktop Sidebar */}
				<div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-white">
					<Sidebar />
				</div>

				{/* Mobile Sidebar */}
				<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
					<SheetContent side="left" className="p-0 w-64">
						<Sidebar mobile />
					</SheetContent>
				</Sheet>

				{/* Main Content */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Mobile Header */}
					<div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
						<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
							<SheetTrigger asChild>
								<Button variant="outline" size="icon">
									<Menu className="h-4 w-4" />
								</Button>
							</SheetTrigger>
						</Sheet>
						<h1 className="font-semibold">Student Portal</h1>
						<div className="w-10" /> {/* Spacer */}
					</div>

					{/* Page Content */}
					<main className="flex-1 overflow-auto p-6">{children}</main>
				</div>
			</div>
		</ProtectedRoute>
	)
}
