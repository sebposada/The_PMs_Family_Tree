import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PersonForm } from "./PersonForm";

export function PeopleManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [personFormOpen, setPersonFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [deletingPerson, setDeletingPerson] = useState<any>(null);

  const { data: people, isLoading } = trpc.people.getAll.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.people.delete.useMutation({
    onSuccess: () => {
      toast.success("Person deleted successfully");
      utils.people.getAll.invalidate();
      setDeletingPerson(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete person");
    },
  });

  const filteredPeople = people?.filter((person) => {
    const query = searchQuery.toLowerCase();
    return (
      person.firstName.toLowerCase().includes(query) ||
      person.lastName.toLowerCase().includes(query)
    );
  });

  const handleEdit = (person: any) => {
    setEditingPerson(person);
    setPersonFormOpen(true);
  };

  const handleDelete = (person: any) => {
    setDeletingPerson(person);
  };

  const confirmDelete = () => {
    if (deletingPerson) {
      deleteMutation.mutate({ id: deletingPerson.id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C3E3C]">People Management</h2>
          <p className="text-[#5A6B5F] mt-1">Add, edit, and manage family members</p>
        </div>
        <Button
          onClick={() => {
            setEditingPerson(null);
            setPersonFormOpen(true);
          }}
          className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B5F]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="pl-10"
        />
      </div>

      {/* People List */}
      {isLoading ? (
        <div className="text-center py-12 text-[#5A6B5F]">Loading...</div>
      ) : filteredPeople && filteredPeople.length === 0 ? (
        <Card className="polaroid-card">
          <CardContent className="py-12 text-center">
            <User className="w-16 h-16 mx-auto text-[#5A6B5F] mb-4" />
            <p className="text-[#5A6B5F] text-lg">
              {searchQuery ? "No people found matching your search" : "No people yet"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setEditingPerson(null);
                  setPersonFormOpen(true);
                }}
                variant="outline"
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Person
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPeople?.map((person) => (
            <Card key={person.id} className="polaroid-card hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[#F5F5F0] flex items-center justify-center">
                      {person.primaryMediaId ? (
                        <img
                          src={`/api/media/${person.primaryMediaId}`}
                          alt={`${person.firstName} ${person.lastName}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <User className="w-8 h-8 text-[#5A6B5F]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-[#2C3E3C]">
                        {person.firstName} {person.lastName}
                      </h3>
                      {(person.birthDate || person.deathDate) && (
                        <p className="text-sm text-[#5A6B5F]">
                          {person.birthDate && new Date(person.birthDate).getFullYear()}
                          {person.birthDate && person.deathDate && "–"}
                          {person.deathDate && new Date(person.deathDate).getFullYear()}
                        </p>
                      )}
                      {person.birthPlace && (
                        <p className="text-sm text-[#5A6B5F]">Born in {person.birthPlace}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(person)}
                      className="text-[#3D5A40] hover:text-[#2C3E3C] hover:bg-[#3D5A40]/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(person)}
                      className="text-[#8B4513] hover:text-[#6B3410] hover:bg-[#8B4513]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Person Form Dialog */}
      <PersonForm
        open={personFormOpen}
        onOpenChange={(open) => {
          setPersonFormOpen(open);
          if (!open) setEditingPerson(null);
        }}
        person={editingPerson}
        onSuccess={() => {
          setEditingPerson(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPerson} onOpenChange={() => setDeletingPerson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Person?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deletingPerson?.firstName} {deletingPerson?.lastName}
              </strong>
              ? This action cannot be undone and will also remove all associated partnerships,
              comments, and media tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#8B4513] hover:bg-[#6B3410]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
