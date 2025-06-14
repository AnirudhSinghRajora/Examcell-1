"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Users, FileText, MessageSquare, Upload, Menu, LogOut, Shield } from "lucide-react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const navigation = [
	{ name: "Dashboard", href: "/admin/dashboard", icon: Home },
	{ name: "Manage Students", href: "/admin/students", icon: Users },
	{ name: "Upload Marks", href: "/admin/marks", icon: Upload },
	{ name: "Manage Queries", href: "/admin/queries", icon: MessageSquare },
	{ name: "Bonafide Requests", href: "/admin/bonafide", icon: FileText },
]

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const Sidebar = ({ mobile = false }) => (
		<div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}>
			<div className="flex items-center gap-2 p-6 border-b">
				<Shield className="h-8 w-8 text-red-600" />
				<div>
					<h2 className="font-semibold">Admin Portal</h2>
					<p className="text-sm text-gray-600">Administrator</p>
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
								isActive ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
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
				<Button variant="outline" className="w-full justify-start" asChild>
					<Link href="/">
						<LogOut className="h-4 w-4 mr-2" />
						Logout
					</Link>
				</Button>
			</div>
		</div>
	)

	return (
		<ProtectedRoute allowedRoles={["ADMIN"]}>
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
						<h1 className="font-semibold">Admin Portal</h1>
						<div className="w-10" /> {/* Spacer */}
					</div>

					{/* Page Content */}
					<main className="flex-1 overflow-auto p-6">{children}</main>
				</div>
			</div>
		</ProtectedRoute>
	)
}
