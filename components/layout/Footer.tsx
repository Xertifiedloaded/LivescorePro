import Link from "next/link"
import { Activity, Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">LiveScore</span>
                <span className="text-xs text-gray-500 -mt-1">Pro</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              Your premier destination for live football scores, betting predictions, and match analysis.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Matches</h3>
            <div className="space-y-3">
              <Link href="/matches" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                All Matches
              </Link>
              <Link href="/live" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Live Matches
              </Link>
              <Link href="/leagues" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Leagues
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <div className="space-y-3">
              <Link href="/login" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Create Account
              </Link>
              <Link href="/dashboard" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Contact Support
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 LiveScore Pro. All rights reserved. Built with ❤️ for football fans.
          </p>
        </div>
      </div>
    </footer>
  )
}
