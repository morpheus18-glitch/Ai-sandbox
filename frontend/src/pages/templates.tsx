"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Clock } from "lucide-react"
import Link from "next/link"

// Template type definition
interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  created_at: string
  is_public: boolean
  created_by: {
    id: string
    name: string
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "conversation", name: "Conversations" },
    { id: "agent", name: "Agents" },
    { id: "analysis", name: "Analysis" },
    { id: "research", name: "Research" },
  ]

  // Sample templates for development
  const sampleTemplates: Template[] = [
    {
      id: "template-1",
      name: "Financial Analysis Team",
      description: "A team of financial experts analyzing market trends and investment opportunities",
      category: "conversation",
      tags: ["finance", "investment", "analysis"],
      created_at: "2023-06-15T14:30:00Z",
      is_public: true,
      created_by: {
        id: "user-1",
        name: "Demo User",
      },
    },
    {
      id: "template-2",
      name: "Research Assistant",
      description: "An agent specialized in academic research and literature review",
      category: "agent",
      tags: ["research", "academic", "assistant"],
      created_at: "2023-06-14T10:15:00Z",
      is_public: true,
      created_by: {
        id: "user-1",
        name: "Demo User",
      },
    },
    {
      id: "template-3",
      name: "Debate Moderator",
      description: "A neutral agent that facilitates debates between multiple perspectives",
      category: "agent",
      tags: ["debate", "moderation", "discussion"],
      created_at: "2023-06-13T16:45:00Z",
      is_public: true,
      created_by: {
        id: "user-1",
        name: "Demo User",
      },
    },
  ]

  useEffect(() => {
    // Fetch templates from Django backend
    const fetchTemplates = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/templates/")

        if (!response.ok) {
          // Use sample data for development
          setTemplates(sampleTemplates)
        } else {
          const data = await response.json()
          setTemplates(data)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        // Fallback to sample data
        setTemplates(sampleTemplates)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Filter templates based on category
  const filteredTemplates = templates.filter(
    (template) => activeCategory === "all" || template.category === activeCategory,
  )

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground">Browse, create, and manage templates for conversations and agents</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 px-4 pb-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 px-4 pb-4">
                <Button className="w-full justify-start" asChild>
                  <Link href="/templates/new">Create Template</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Templates grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags &&
                        template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Created {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground text-center mb-4">No templates found in this category</p>
                <Button asChild>
                  <Link href="/templates/new">Create Template</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
