import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RouteGuard } from "@/components/RouteGuard";
import { Navigation } from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

function DirectoryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastName-asc");
  
  const { data: people, isLoading } = trpc.people.getAll.useQuery();

  const filteredAndSortedPeople = useMemo(() => {
    if (!people) return [];

    let filtered = people;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (person) =>
          person.firstName.toLowerCase().includes(query) ||
          person.lastName.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered];
    const [field, order] = sortBy.split("-");

    sorted.sort((a, b) => {
      let aVal = "";
      let bVal = "";

      if (field === "lastName") {
        aVal = `${a.lastName} ${a.firstName}`;
        bVal = `${b.lastName} ${b.firstName}`;
      } else if (field === "firstName") {
        aVal = `${a.firstName} ${a.lastName}`;
        bVal = `${b.firstName} ${b.lastName}`;
      }

      if (order === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    return sorted;
  }, [people, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navigation />
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-[#2C3E3C]">Family Directory</h1>
          <p className="text-[#5A6B5F] mt-1">Browse all family members</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5A6B5F] w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#3D5A40]/20 focus:border-[#3D5A40] bg-white"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] border-[#3D5A40]/20 bg-white">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastName-asc">Last Name (A-Z)</SelectItem>
              <SelectItem value="lastName-desc">Last Name (Z-A)</SelectItem>
              <SelectItem value="firstName-asc">First Name (A-Z)</SelectItem>
              <SelectItem value="firstName-desc">First Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-[#5A6B5F]">Loading...</div>
        ) : filteredAndSortedPeople.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-[#5A6B5F] mb-4" />
            <p className="text-[#5A6B5F] text-lg">
              {searchQuery ? "No people found matching your search" : "No people in the directory yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedPeople.map((person) => (
              <Link key={person.id} href={`/people/${person.id}`}>
                <Card className="polaroid-card cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-4">
                    {/* Photo */}
                    <div className="aspect-square bg-[#F5F5F0] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {person.primaryMediaId ? (
                        <img
                          src={`/api/media/${person.primaryMediaId}`}
                          alt={`${person.firstName} ${person.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-[#5A6B5F]" />
                      )}
                    </div>
                    {/* Name */}
                    <h3 className="text-center font-serif font-semibold text-[#2C3E3C] text-lg">
                      {person.firstName} {person.lastName}
                    </h3>
                    {/* Birth-Death Years */}
                    {(person.birthDate || person.deathDate) && (
                      <p className="text-center text-sm text-[#5A6B5F] mt-1">
                        {person.birthDate && new Date(person.birthDate).getFullYear()}
                        {person.birthDate && person.deathDate && "–"}
                        {person.deathDate && new Date(person.deathDate).getFullYear()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Directory() {
  return (
    <RouteGuard requireAuth requireApproval>
      <DirectoryContent />
    </RouteGuard>
  );
}
