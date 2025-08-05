"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usersApi } from "@/lib/api"
import { User, Settings, CreditCard, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface UserBalance {
  balance: number
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [fundAmount, setFundAmount] = useState("")

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await usersApi.getBalance()
        setBalance(response.data.balance || 0)
      } catch (error) {
        console.error("Error fetching balance:", error)
        setBalance(0)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
      fetchBalance()
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)

    try {
      await usersApi.updateProfile(profileForm)
      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setUpdating(false)
    }
  }

  const handleAddFunds = async (amount: number) => {
    setUpdating(true)
    setMessage(null)

    try {
      await usersApi.addFunds(amount)
      setMessage({ type: "success", text: `Successfully added $${amount.toFixed(2)} to your account!` })

      // Refresh balance
      const response = await usersApi.getBalance()
      setBalance(response.data.balance || 0)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add funds. Please try again." })
    } finally {
      setUpdating(false)
    }
  }

  const handleCustomFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(fundAmount)

    if (amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount." })
      return
    }

    await handleAddFunds(amount)
    setFundAmount("")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg md:col-span-2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Username</Label>
                <p className="font-semibold">{user?.username}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Balance</Label>
                <p className="font-semibold text-green-600 text-lg">${balance.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                        />
                      </div>
                      <Button type="submit" disabled={updating}>
                        {updating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Account Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-primary to-green-600 text-white rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Current Balance</h3>
                      <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[10, 25, 50, 100].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => handleAddFunds(amount)}
                          disabled={updating}
                          className="h-12"
                        >
                          Add ${amount}
                        </Button>
                      ))}
                    </div>

                    <form onSubmit={handleCustomFunds} className="space-y-2">
                      <Label htmlFor="customAmount">Custom Amount</Label>
                      <div className="flex gap-2">
                        <Input
                          id="customAmount"
                          type="number"
                          placeholder="Enter amount"
                          min="1"
                          step="0.01"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                        />
                        <Button type="submit" disabled={updating || !fundAmount}>
                          {updating ? "Adding..." : "Add Funds"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Password</h4>
                      <p className="text-sm text-gray-600 mb-3">Keep your account secure with a strong password</p>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <div className="p-4 border rounded-lg border-red-200">
                      <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                      <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all data</p>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to logout?")) {
                            logout()
                          }
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
