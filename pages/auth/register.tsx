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
import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
// @ts-ignore
    try {
      // @ts-ignore
      await register(formData.name, formData.email, formData.password)
      router.push("/dashboard")
    } catch (err) {
      setError("Registration failed. Please try again.")
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

        {/* Main content - centered and responsive */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-xl sm:shadow-2xl bg-white/95 backdrop-blur-sm">
              {/* Header - responsive sizing */}
              <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  Create Account
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Join thousands of football fans today
                </p>
              </CardHeader>

              {/* Form content - mobile-optimized spacing */}
              <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
                {error && (
                  <Alert variant="destructive" className="mb-4 sm:mb-6">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 h-11 sm:h-12 text-base border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 h-11 sm:h-12 text-base border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                        autoComplete="new-password"
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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 pr-10 h-11 sm:h-12 text-base border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>


                  <div className="flex items-start space-x-3 pt-2">
                    <input
                      id="terms"
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 focus:ring-offset-0"
                      required
                    />
                    <Label htmlFor="terms" className="text-xs text-gray-600 leading-5 flex-1">
                      I agree to the{" "}
                      <Link 
                        href="/terms" 
                        className="text-primary hover:underline font-medium focus:outline-none focus:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link 
                        href="/privacy" 
                        className="text-primary hover:underline font-medium focus:outline-none focus:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {/* Submit Button - mobile-optimized */}
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
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                {/* Sign in link - mobile-friendly */}
                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Already have an account?{" "}
                    <Link 
                      href="/auth/login" 
                      className="text-primary font-semibold hover:underline focus:outline-none focus:underline transition-colors"
                    >
                      Sign in
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