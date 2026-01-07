import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Image, Plus, Tag, Trash2, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function MediaManagement() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [taggingMedia, setTaggingMedia] = useState<any>(null);

  const { data: media, isLoading } = trpc.media.getAll.useQuery();
  const { data: peopleData } = trpc.people.getAll.useQuery();

  // Deduplicate people by ID to prevent duplicate key errors
  const people = peopleData?.reduce((acc, person) => {
    if (!acc.find((p) => p.id === person.id)) {
      acc.push(person);
    }
    return acc;
  }, [] as typeof peopleData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C3E3C]">Media Management</h2>
          <p className="text-[#5A6B5F] mt-1">Upload and manage family photos</p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-[#5A6B5F]">Loading...</div>
      ) : media && media.length === 0 ? (
        <Card className="polaroid-card">
          <CardContent className="py-12 text-center">
            <Image className="w-16 h-16 mx-auto text-[#5A6B5F] mb-4" />
            <p className="text-[#5A6B5F] text-lg">No photos yet</p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media?.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onTag={() => setTaggingMedia(item)}
              people={people || []}
            />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        people={people || []}
      />

      {/* Tagging Dialog */}
      {taggingMedia && (
        <TaggingDialog
          media={taggingMedia}
          people={people || []}
          onClose={() => setTaggingMedia(null)}
        />
      )}
    </div>
  );
}

// Media Card Component
function MediaCard({ media, onTag, people }: { media: any; onTag: () => void; people: any[] }) {
  const utils = trpc.useUtils();
  const { data: taggedPeople } = trpc.media.getTaggedPeople.useQuery({ mediaId: media.id });

  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted successfully");
      utils.media.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete photo");
    },
  });

  return (
    <Card className="polaroid-card group relative overflow-hidden">
      <CardContent className="p-2">
        <div className="aspect-square bg-[#F5F5F0] rounded-lg overflow-hidden mb-2">
          <img
            src={media.url}
            alt={media.caption || "Family photo"}
            className="w-full h-full object-cover"
          />
        </div>
        {media.caption && (
          <p className="text-xs text-[#5A6B5F] line-clamp-2 mb-1">{media.caption}</p>
        )}
        {taggedPeople && taggedPeople.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {taggedPeople.slice(0, 2).map((person) => (
              <Badge key={person.id} variant="secondary" className="text-xs">
                {person.firstName}
              </Badge>
            ))}
            {taggedPeople.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{taggedPeople.length - 2}
              </Badge>
            )}
          </div>
        )}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTag}
            className="flex-1 text-[#3D5A40] hover:bg-[#3D5A40]/10"
          >
            <Tag className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate({ id: media.id })}
            className="flex-1 text-[#8B4513] hover:bg-[#8B4513]/10"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Upload Dialog Component
function UploadDialog({
  open,
  onOpenChange,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: any[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<"photo" | "document">("photo");
  const [takenDate, setTakenDate] = useState("");
  const [location, setLocation] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const createMediaMutation = trpc.media.create.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        // Upload to S3
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }

        const { fileKey, url } = await uploadResponse.json();

        // Create media record
        await createMediaMutation.mutateAsync({
          fileKey,
          url,
          category,
          caption: caption || undefined,
          takenDate: takenDate || undefined,
          location: location || undefined,
        });
      }

      toast.success(`Successfully uploaded ${files.length} photo(s)`);
      utils.media.getAll.invalidate();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setCaption("");
    setCategory("photo");
    setTakenDate("");
    setLocation("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#2C3E3C]">
            Upload Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Select Files</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#3D5A40]/30 rounded-lg p-8 text-center cursor-pointer hover:border-[#3D5A40] transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto text-[#5A6B5F] mb-2" />
              <p className="text-sm text-[#5A6B5F]">
                Click to select photos or drag and drop
              </p>
              <p className="text-xs text-[#5A6B5F] mt-1">
                JPG, PNG, WebP (max 20MB per file)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#F5F5F0] rounded-lg"
                  >
                    <span className="text-sm text-[#2C3E3C] truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-[#8B4513]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this photo..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="takenDate">Date Taken</Label>
              <Input
                id="takenDate"
                type="date"
                value={takenDate}
                onChange={(e) => setTakenDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
            >
              {uploading ? "Uploading..." : `Upload ${files.length} Photo(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tagging Dialog Component
function TaggingDialog({
  media,
  people,
  onClose,
}: {
  media: any;
  people: any[];
  onClose: () => void;
}) {
  const [selectedPersonId, setSelectedPersonId] = useState("");

  const { data: taggedPeople } = trpc.media.getTaggedPeople.useQuery({ mediaId: media.id });
  const utils = trpc.useUtils();

  const tagMutation = trpc.media.tagPerson.useMutation({
    onSuccess: () => {
      toast.success("Person tagged successfully");
      utils.media.getTaggedPeople.invalidate({ mediaId: media.id });
      utils.media.getAll.invalidate();
      setSelectedPersonId("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to tag person");
    },
  });

  const untagMutation = trpc.media.untagPerson.useMutation({
    onSuccess: () => {
      toast.success("Person untagged successfully");
      utils.media.getTaggedPeople.invalidate({ mediaId: media.id });
      utils.media.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to untag person");
    },
  });

  const availablePeople = people.filter(
    (person) => !taggedPeople?.some((tagged) => tagged.id === person.id)
  );

  const handleTag = () => {
    if (!selectedPersonId) {
      toast.error("Please select a person");
      return;
    }

    tagMutation.mutate({
      mediaId: media.id,
      personId: parseInt(selectedPersonId),
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#2C3E3C]">
            Tag People in Photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Preview */}
          <div className="aspect-video bg-[#F5F5F0] rounded-lg overflow-hidden">
            <img
              src={media.url}
              alt={media.caption || "Photo"}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Add Tag */}
          <div className="space-y-2">
            <Label>Tag Person</Label>
            <div className="flex gap-2">
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleTag}
                disabled={!selectedPersonId || tagMutation.isPending}
                className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tagged People */}
          <div className="space-y-2">
            <Label>Tagged People</Label>
            {taggedPeople && taggedPeople.length === 0 ? (
              <p className="text-sm text-[#5A6B5F] py-4 text-center">No one tagged yet</p>
            ) : (
              <div className="space-y-2">
                {taggedPeople?.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-2 bg-[#F5F5F0] rounded-lg"
                  >
                    <span className="text-sm text-[#2C3E3C]">
                      {person.firstName} {person.lastName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        untagMutation.mutate({
                          mediaId: media.id,
                          personId: person.id,
                        })
                      }
                      className="text-[#8B4513] hover:text-[#6B3410]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
