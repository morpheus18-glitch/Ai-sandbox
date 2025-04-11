import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    let sql = "SELECT * FROM conversation_logs ORDER BY created_at DESC LIMIT 100"
    let params: any[] = []

    if (userId) {
      sql = "SELECT * FROM conversation_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100"
      params = [userId]
    }

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, title, summary } = await req.json()

    const result = await query(
      "INSERT INTO conversation_logs (user_id, title, summary) VALUES ($1, $2, $3) RETURNING *",
      [user_id, title, summary],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
