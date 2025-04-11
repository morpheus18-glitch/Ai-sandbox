import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query("SELECT * FROM algorithms ORDER BY created_at DESC")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching algorithms:", error)
    return NextResponse.json({ error: "Failed to fetch algorithms" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, code, created_by } = await req.json()

    const result = await query(
      "INSERT INTO algorithms (name, description, code, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, code, created_by],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating algorithm:", error)
    return NextResponse.json({ error: "Failed to create algorithm" }, { status: 500 })
  }
}
