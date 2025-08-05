"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      router.push("/dashboard")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile-optimized container */}
      <div className="flex flex-col min-h-screen">
        {/* Header with back button - optimized for mobile */}
        <div className="flex-shrink-0 p-4 sm:p-6">
          <Button 
            variant="ghost" 
            className="p-2 sm:p-3 -ml-2 sm:-ml-3 hover:bg-slate-100 rounded-lg" 
            asChild
          >
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-xl sm:shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  Welcome Back
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Sign in to your account to continue
                </p>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
                {error && (
                  <Alert variant="destructive" className="mb-4 sm:mb-6">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-11 sm:h-12 text-base border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 h-11 sm:h-12 text-base border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-2">
                    <div className="flex items-center space-x-3">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-0"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm text-primary hover:underline font-medium focus:outline-none focus:underline transition-colors self-start sm:self-auto"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 h-12 sm:h-13 text-base sm:text-lg font-semibold mt-6 sm:mt-8 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Don't have an account?{" "}
                    <Link 
                      href="/auth/register" 
                      className="text-primary font-semibold hover:underline focus:outline-none focus:underline transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}