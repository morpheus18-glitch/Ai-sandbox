import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    let sql = "SELECT * FROM files ORDER BY created_at DESC"
    let params: any[] = []

    if (userId) {
      sql = "SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC"
      params = [userId]
    }

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, name, type, size, url } = await req.json()

    const result = await query(
      "INSERT INTO files (user_id, name, type, size, url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, name, type, size, url],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating file:", error)
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 })
  }
}
