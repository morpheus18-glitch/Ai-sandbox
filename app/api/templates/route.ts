import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query("SELECT * FROM templates ORDER BY created_at DESC")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, category, content, tags, created_by, is_public } = await req.json()

    const result = await query(
      `INSERT INTO templates 
       (name, description, category, content, tags, created_by, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description, category, content, tags, created_by, is_public || false],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
