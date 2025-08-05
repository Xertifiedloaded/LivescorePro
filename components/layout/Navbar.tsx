"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  Trophy,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { href: "/matches", label: "Matches", icon: Trophy },
    { href: "/live", label: "Live", icon: Activity },
    { href: "/leagues", label: "Leagues", icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">
                  LiveScore
                </span>
                <span className="text-xs text-gray-500 -mt-1">Pro</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.href === "/live" && (
                      <Badge
                        variant="destructive"
                        className="text-xs px-1.5 py-0.5 ml-1"
                      >
                        LIVE
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 p-4 bg-white shadow-xl border-0 rounded-xl"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center justify-start gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-white font-semibold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-gray-900">
                        {user.username}
                      </p>
                      <p className="truncate text-sm text-gray-600">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-lg"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-3"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-lg"
                  >
                    <Link
                      href="/dashboard/predictions"
                      className="flex items-center gap-3 p-3"
                    >
                      <Trophy className="h-4 w-4" />
                      My Predictions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-lg"
                  >
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 p-3"
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-t my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="bg-black text-white hover:bg-primary/90 shadow-lg"
                >
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.href === "/live" && (
                      <Badge
                        variant="destructive"
                        className="text-xs px-1.5 py-0.5 ml-auto"
                      >
                        LIVE
                      </Badge>
                    )}
                  </Link>
                );
              })}
              {!user && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-primary text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
