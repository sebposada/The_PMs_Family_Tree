import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PersonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate?: Date | null;
    deathDate?: Date | null;
    birthPlace?: string | null;
    deathPlace?: string | null;
    bioMarkdown?: string | null;
    primaryMediaId?: number | null;
  };
  onSuccess?: () => void;
}

export function PersonForm({ open, onOpenChange, person, onSuccess }: PersonFormProps) {
  const [firstName, setFirstName] = useState(person?.firstName || "");
  const [lastName, setLastName] = useState(person?.lastName || "");
  const [birthDate, setBirthDate] = useState(
    person?.birthDate ? new Date(person.birthDate).toISOString().split("T")[0] : ""
  );
  const [deathDate, setDeathDate] = useState(
    person?.deathDate ? new Date(person.deathDate).toISOString().split("T")[0] : ""
  );
  const [birthPlace, setBirthPlace] = useState(person?.birthPlace || "");
  const [deathPlace, setDeathPlace] = useState(person?.deathPlace || "");
  const [bioMarkdown, setBioMarkdown] = useState(person?.bioMarkdown || "");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(person?.primaryMediaId || null);

  // Fetch photos tagged with this person
  const { data: personPhotos } = trpc.media.getByPerson.useQuery(
    { personId: person?.id || 0 },
    { enabled: !!person?.id }
  );

  const utils = trpc.useUtils();
  const createMutation = trpc.people.create.useMutation({
    onSuccess: () => {
      toast.success("Person created successfully");
      utils.people.getAll.invalidate();
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create person");
    },
  });

  const updateMutation = trpc.people.update.useMutation({
    onSuccess: () => {
      toast.success("Person updated successfully");
      utils.people.getAll.invalidate();
      if (person) {
        utils.people.getById.invalidate({ id: person.id });
      }
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update person");
    },
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setDeathDate("");
    setBirthPlace("");
    setDeathPlace("");
    setBioMarkdown("");
    setShowPreview(false);
    setSelectedPhotoId(null);
  };

  useEffect(() => {
    if (person) {
      setFirstName(person.firstName);
      setLastName(person.lastName);
      setBirthDate(person.birthDate ? new Date(person.birthDate).toISOString().split("T")[0] : "");
      setDeathDate(person.deathDate ? new Date(person.deathDate).toISOString().split("T")[0] : "");
      setBirthPlace(person.birthPlace || "");
      setDeathPlace(person.deathPlace || "");
      setBioMarkdown(person.bioMarkdown || "");
      setSelectedPhotoId(person.primaryMediaId || null);
    }
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate || undefined,
      deathDate: deathDate || undefined,
      birthPlace: birthPlace.trim() || undefined,
      deathPlace: deathPlace.trim() || undefined,
      bioMarkdown: bioMarkdown.trim() || undefined,
      primaryMediaId: selectedPhotoId || undefined,
    };

    if (person) {
      updateMutation.mutate({ id: person.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#2C3E3C]">
            {person ? "Edit Person" : "Add New Person"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deathDate">Death Date</Label>
              <Input
                id="deathDate"
                type="date"
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
              />
            </div>
          </div>

          {/* Place Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="New York, NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deathPlace">Death Place</Label>
              <Input
                id="deathPlace"
                value={deathPlace}
                onChange={(e) => setDeathPlace(e.target.value)}
                placeholder="Los Angeles, CA"
              />
            </div>
          </div>

          {/* Primary Photo Selector */}
          {person && (
            <div className="space-y-3">
              <Label>Primary Profile Photo</Label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 border-2 border-[#3D5A40]/20">
                    {selectedPhotoId && personPhotos?.find(p => p.id === selectedPhotoId) ? (
                      <AvatarImage src={personPhotos.find(p => p.id === selectedPhotoId)?.url} />
                    ) : (
                      <AvatarFallback className="bg-[#F5F5F0]">
                        <User className="h-12 w-12 text-[#5A6B5F]" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1">
                  {personPhotos && personPhotos.length > 0 ? (
                    <>
                      <p className="text-sm text-[#5A6B5F] mb-2">
                        Select a photo from those tagged with {firstName}:
                      </p>
                      <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 border border-[#3D5A40]/20 rounded-lg bg-[#F5F5F0]">
                        {personPhotos.map((photo) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => setSelectedPhotoId(photo.id)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedPhotoId === photo.id
                                ? "border-[#3D5A40] ring-2 ring-[#3D5A40]/30"
                                : "border-transparent hover:border-[#3D5A40]/50"
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || ""}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      {selectedPhotoId && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPhotoId(null)}
                          className="mt-2 text-[#8B4513]"
                        >
                          Clear Selection
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#5A6B5F] italic">
                      No photos tagged with this person yet. Upload photos in Media Management and tag {firstName} to select a primary photo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bio Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bioMarkdown">Biography (Markdown)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[#3D5A40]"
              >
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </div>
            {showPreview ? (
              <div className="border border-[#3D5A40]/20 rounded-lg p-4 bg-[#F5F5F0] min-h-[200px] prose prose-sm max-w-none">
                {bioMarkdown ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{bioMarkdown}</ReactMarkdown>
                ) : (
                  <p className="text-[#5A6B5F] italic">No biography yet</p>
                )}
              </div>
            ) : (
              <Textarea
                id="bioMarkdown"
                value={bioMarkdown}
                onChange={(e) => setBioMarkdown(e.target.value)}
                placeholder="Write a biography using Markdown formatting..."
                rows={8}
                className="font-mono text-sm"
              />
            )}
            <p className="text-xs text-[#5A6B5F]">
              Supports Markdown: **bold**, *italic*, [links](url), etc.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#3D5A40]/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                if (!person) resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
            >
              {isLoading ? "Saving..." : person ? "Update Person" : "Create Person"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
