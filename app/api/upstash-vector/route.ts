import { Index } from "@upstash/vector"
import { NextResponse } from "next/server"

export async function GET() {
  const url = process.env.UPSTASH_VECTOR_REST_URL
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN

  if (!url) {
    console.error("UPSTASH_VECTOR_REST_URL is not set")
    return new NextResponse(JSON.stringify({ error: "UPSTASH_VECTOR_REST_URL is not set" }), { status: 500 })
  }

  if (!token) {
    console.error("UPSTASH_VECTOR_REST_TOKEN is not set")
    return new NextResponse(JSON.stringify({ error: "UPSTASH_VECTOR_REST_TOKEN is not set" }), { status: 500 })
  }

  try {
    const index = new Index({
      url: url,
      token: token,
    })

    const result = await index.fetch(["vector-id"], { includeData: true })

    return new NextResponse(JSON.stringify({ result: result.data[0] }), { status: 200 })
  } catch (e) {
    console.error("Error fetching from Upstash Vector:", e)
    return new NextResponse(JSON.stringify({ error: e.message || "Failed to fetch from Upstash Vector" }), {
      status: 500,
    })
  }
}
