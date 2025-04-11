"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, Settings, LogOut } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Mock user for development
  const user = {
    name: "Demo User",
    email: "user@example.com",
    image: null,
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">LLM Sandbox</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/templates"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/templates") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Templates
            </Link>
            <Link
              href="/agents"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/agents") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Agents
            </Link>
            <Link
              href="/sandbox"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/sandbox") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Sandbox
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" onClick={toggleMenu}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                  <div className="p-2">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <div className="h-px bg-muted my-1"></div>
                  <Link
                    href="/profile"
                    className="block px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  <div className="h-px bg-muted my-1"></div>
                  <button
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <Button variant="default" size="sm" asChild className="hidden md:flex">
              <Link href="/sandbox">New Conversation</Link>
            </Button>
          </div>
          <Button variant="ghost" size="icon" aria-label="Toggle Menu" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/templates"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/templates") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Templates
              </Link>
              <Link
                href="/agents"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/agents") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Agents
              </Link>
              <Link
                href="/sandbox"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/sandbox") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Sandbox
              </Link>
            </nav>
            <Button variant="default" asChild onClick={closeMenu} className="w-full">
              <Link href="/sandbox">New Conversation</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
