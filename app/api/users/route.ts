import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query("SELECT * FROM users ORDER BY created_at DESC LIMIT 100")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()

    // In a real app, you would hash the password before storing it
    const result = await query("INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *", [
      email,
      name,
      password,
    ])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
