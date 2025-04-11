"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import AuthStatus from "@/components/auth-status"

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const [nextAuthUrl, setNextAuthUrl] = useState<string | null>(null)
  const [nextAuthSecret, setNextAuthSecret] = useState<boolean>(false)

  useEffect(() => {
    // Check environment variables
    const checkEnv = async () => {
      try {
        const response = await fetch("/api/check-env")
        const data = await response.json()
        setNextAuthUrl(data.NEXTAUTH_URL || null)
        setNextAuthSecret(!!data.NEXTAUTH_SECRET)
      } catch (error) {
        console.error("Failed to check environment variables:", error)
      }
    }

    checkEnv()
  }, [])

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">NextAuth.js Debug Page</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current session information</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStatus />

            {status === "authenticated" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Session Data:</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(session, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {status === "authenticated" ? (
              <Button variant="destructive" onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => signIn()}>Sign In</Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">NEXTAUTH_URL:</h3>
              {nextAuthUrl ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>NEXTAUTH_URL is set</AlertTitle>
                  <AlertDescription>{nextAuthUrl}</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>NEXTAUTH_URL is missing</AlertTitle>
                  <AlertDescription>
                    Please set NEXTAUTH_URL in your .env.local file (e.g., http://localhost:3000)
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">NEXTAUTH_SECRET:</h3>
              {nextAuthSecret ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>NEXTAUTH_SECRET is set</AlertTitle>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>NEXTAUTH_SECRET is missing</AlertTitle>
                  <AlertDescription>Please set NEXTAUTH_SECRET in your .env.local file</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>CLIENT_FETCH_ERROR</AlertTitle>
              <AlertDescription>
                This error typically occurs when there's an issue with the NEXTAUTH_URL environment variable or when the
                NextAuth.js API routes are not properly set up. Make sure NEXTAUTH_URL is a valid URL with the protocol
                (http:// or https://) and no trailing slash.
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Invalid URL Format</AlertTitle>
              <AlertDescription>
                If you see "The string did not match the expected pattern" error, check that your NEXTAUTH_URL is
                properly formatted (e.g., http://localhost:3000) and doesn't contain any special characters or spaces.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
