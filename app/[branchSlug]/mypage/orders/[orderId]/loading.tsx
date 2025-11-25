export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-12 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  )
}
