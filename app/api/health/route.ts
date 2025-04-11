import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  }

  // Check database connection
  try {
    const pool = getPool()
    const client = await pool.connect()
    try {
      const result = await client.query("SELECT NOW()")
      healthCheck["database"] = {
        status: "connected",
        timestamp: result.rows[0].now,
      }
    } finally {
      client.release()
    }
  } catch (error) {
    healthCheck["database"] = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown database error",
    }
  }

  // Check environment variables
  healthCheck["environment_variables"] = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
  }

  return NextResponse.json(healthCheck)
}
