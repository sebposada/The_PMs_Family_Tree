import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RouteGuard } from "@/components/RouteGuard";
import { trpc } from "@/lib/trpc";
import { Search, User } from "lucide-react";
import { useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function TreeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: people, isLoading } = trpc.people.getAll.useQuery();
  const { data: partnerships } = trpc.partnerships.getAll.useQuery();

  // TODO: Implement React Flow tree visualization
  // For now, show a simple list view

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-[#2C3E3C]">Family Tree</h1>
          <p className="text-[#5A6B5F] mt-1">Interactive family tree visualization</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5A6B5F] w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for a person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#3D5A40]/20 focus:border-[#3D5A40] bg-white"
            />
          </div>
        </div>

        {/* Tree Visualization Placeholder */}
        <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
          <Alert>
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium text-[#2C3E3C]">Interactive Family Tree Coming Soon</p>
                <p className="text-[#5A6B5F]">
                  The interactive family tree with zoom, pan, minimap, and search functionality 
                  is currently under development. This feature will allow you to:
                </p>
                <ul className="list-disc list-inside text-[#5A6B5F] space-y-1">
                  <li>Visualize the complete family tree with all relationships</li>
                  <li>Zoom and pan to explore different branches</li>
                  <li>Use the minimap for easy navigation</li>
                  <li>Search for specific family members and jump to their position</li>
                  <li>Click on any person to view their detailed page</li>
                </ul>
                <p className="text-[#5A6B5F]">
                  In the meantime, you can browse family members through the{" "}
                  <a href="/directory" className="text-[#3D5A40] hover:underline font-medium">
                    Directory
                  </a>
                  .
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Simple List View for now */}
          {isLoading ? (
            <div className="text-center py-8 text-[#5A6B5F]">Loading...</div>
          ) : people && people.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-serif font-semibold text-[#2C3E3C] mb-4">
                Family Members ({people.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map((person) => (
                  <a
                    key={person.id}
                    href={`/people/${person.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#3D5A40]/10 hover:bg-[#F5F5F0] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#5A6B5F]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C3E3C]">
                        {person.firstName} {person.lastName}
                      </p>
                      {(person.birthDate || person.deathDate) && (
                        <p className="text-sm text-[#5A6B5F]">
                          {person.birthDate && new Date(person.birthDate).getFullYear()}
                          {person.birthDate && person.deathDate && "–"}
                          {person.deathDate && new Date(person.deathDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </main>
    </div>
  );
}

export default function Tree() {
  return (
    <RouteGuard requireAuth requireApproval>
      <TreeContent />
    </RouteGuard>
  );
}
