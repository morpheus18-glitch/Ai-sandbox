import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    let sql = "SELECT * FROM todos ORDER BY created_at DESC"
    const params: any[] = []

    if (search) {
      sql = "SELECT * FROM todos WHERE title ILIKE $1 ORDER BY created_at DESC"
      params.push(`%${search}%`)
    }

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, status, priority, due_date, user_id } = await req.json()

    const result = await query(
      "INSERT INTO todos (title, description, status, priority, due_date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, status || "pending", priority || "medium", due_date, user_id],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 })
  }
}
