import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")

  let errorMessage = "An unknown authentication error occurred"
  let errorDetails = ""

  // Map error codes to more descriptive messages
  if (error) {
    switch (error) {
      case "Configuration":
        errorMessage = "There is a problem with the server configuration"
        errorDetails =
          "Please check that NEXTAUTH_URL and NEXTAUTH_SECRET are properly set in your environment variables."
        break
      case "AccessDenied":
        errorMessage = "You do not have permission to sign in"
        errorDetails = "Your account may not have the necessary permissions to access this resource."
        break
      case "Verification":
        errorMessage = "The token has expired or has already been used"
        errorDetails = "Please request a new verification token or try signing in again."
        break
      case "CredentialsSignin":
        errorMessage = "The email or password you entered is incorrect"
        errorDetails = "Please check your credentials and try again."
        break
      case "SessionRequired":
        errorMessage = "You must be signed in to access this page"
        errorDetails = "Please sign in to continue."
        break
      default:
        errorMessage = `Authentication error: ${error}`
        errorDetails = "An unexpected error occurred during authentication."
    }
  }

  // Return a JSON response with the error details
  return NextResponse.json(
    {
      error: error || "Unknown",
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
    },
    { status: 400 },
  )
}
