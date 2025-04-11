import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query("SELECT * FROM todos WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching todo:", error)
    return NextResponse.json({ error: "Failed to fetch todo" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { title, description, status, priority, due_date } = await req.json()

    const result = await query(
      `UPDATE todos 
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING *`,
      [title, description, status, priority, due_date, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query("DELETE FROM todos WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Todo deleted successfully" })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 })
  }
}
