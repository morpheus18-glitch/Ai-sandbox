import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Sample templates for development
const templates = [
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

// Categories for filtering
const categories = [
  { id: "all", name: "All Templates" },
  { id: "conversation", name: "Conversations" },
  { id: "agent", name: "Agents" },
  { id: "analysis", name: "Analysis" },
  { id: "research", name: "Research" },
]

export default function TemplatesPage() {
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
                    variant={category.id === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
