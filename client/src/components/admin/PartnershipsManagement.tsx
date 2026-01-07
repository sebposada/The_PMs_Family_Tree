import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Heart, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PartnershipsManagement() {
  const [partnershipFormOpen, setPartnershipFormOpen] = useState(false);
  const [deletingPartnership, setDeletingPartnership] = useState<any>(null);
  const [managingChildren, setManagingChildren] = useState<any>(null);

  const { data: partnerships, isLoading } = trpc.partnerships.getAll.useQuery();
  const { data: people } = trpc.people.getAll.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.partnerships.delete.useMutation({
    onSuccess: () => {
      toast.success("Partnership deleted successfully");
      utils.partnerships.getAll.invalidate();
      setDeletingPartnership(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete partnership");
    },
  });

  const getPersonName = (personId: number) => {
    const person = people?.find((p) => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C3E3C]">Partnerships Management</h2>
          <p className="text-[#5A6B5F] mt-1">Manage relationships and assign children</p>
        </div>
        <Button
          onClick={() => setPartnershipFormOpen(true)}
          className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partnership
        </Button>
      </div>

      {/* Partnerships List */}
      {isLoading ? (
        <div className="text-center py-12 text-[#5A6B5F]">Loading...</div>
      ) : partnerships && partnerships.length === 0 ? (
        <Card className="polaroid-card">
          <CardContent className="py-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-[#5A6B5F] mb-4" />
            <p className="text-[#5A6B5F] text-lg">No partnerships yet</p>
            <Button
              onClick={() => setPartnershipFormOpen(true)}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Partnership
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partnerships?.map((partnership) => (
            <Card key={partnership.id} className="polaroid-card hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart className="w-8 h-8 text-[#8B4513]" />
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-[#2C3E3C]">
                        {getPersonName(partnership.partner1Id)} & {getPersonName(partnership.partner2Id)}
                      </h3>
                      {(partnership.startDate || partnership.endDate) && (
                        <p className="text-sm text-[#5A6B5F]">
                          {partnership.startDate && new Date(partnership.startDate).getFullYear()}
                          {partnership.startDate && partnership.endDate && "–"}
                          {partnership.endDate && new Date(partnership.endDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setManagingChildren(partnership)}
                      className="text-[#3D5A40] hover:text-[#2C3E3C] hover:bg-[#3D5A40]/10"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Children
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingPartnership(partnership)}
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

      {/* Partnership Form Dialog */}
      <PartnershipForm
        open={partnershipFormOpen}
        onOpenChange={setPartnershipFormOpen}
        people={people || []}
      />

      {/* Children Management Dialog */}
      {managingChildren && (
        <ChildrenManagement
          partnership={managingChildren}
          people={people || []}
          onClose={() => setManagingChildren(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPartnership} onOpenChange={() => setDeletingPartnership(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partnership?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the partnership between{" "}
              <strong>
                {deletingPartnership && getPersonName(deletingPartnership.partner1Id)} &{" "}
                {deletingPartnership && getPersonName(deletingPartnership.partner2Id)}
              </strong>
              ? This will also remove all children assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPartnership && deleteMutation.mutate({ id: deletingPartnership.id })}
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

// Partnership Form Component
function PartnershipForm({
  open,
  onOpenChange,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: any[];
}) {
  const [partner1Id, setPartner1Id] = useState("");
  const [partner2Id, setPartner2Id] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const utils = trpc.useUtils();
  const createMutation = trpc.partnerships.create.useMutation({
    onSuccess: () => {
      toast.success("Partnership created successfully");
      utils.partnerships.getAll.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create partnership");
    },
  });

  const resetForm = () => {
    setPartner1Id("");
    setPartner2Id("");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!partner1Id || !partner2Id) {
      toast.error("Please select both partners");
      return;
    }

    if (partner1Id === partner2Id) {
      toast.error("Partners must be different people");
      return;
    }

    createMutation.mutate({
      partner1Id: parseInt(partner1Id),
      partner2Id: parseInt(partner2Id),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#2C3E3C]">
            Add New Partnership
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner1">Partner 1 *</Label>
            <Select value={partner1Id} onValueChange={setPartner1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select first partner" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.firstName} {person.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner2">Partner 2 *</Label>
            <Select value={partner2Id} onValueChange={setPartner2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select second partner" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.firstName} {person.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
            >
              {createMutation.isPending ? "Creating..." : "Create Partnership"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Children Management Component
function ChildrenManagement({
  partnership,
  people,
  onClose,
}: {
  partnership: any;
  people: any[];
  onClose: () => void;
}) {
  const [selectedChildId, setSelectedChildId] = useState("");

  const { data: children } = trpc.partnerships.getChildren.useQuery({
    partnershipId: partnership.id,
  });

  const utils = trpc.useUtils();
  const addChildMutation = trpc.partnerships.addChild.useMutation({
    onSuccess: () => {
      toast.success("Child added successfully");
      utils.partnerships.getChildren.invalidate({ partnershipId: partnership.id });
      setSelectedChildId("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add child");
    },
  });

  const removeChildMutation = trpc.partnerships.removeChild.useMutation({
    onSuccess: () => {
      toast.success("Child removed successfully");
      utils.partnerships.getChildren.invalidate({ partnershipId: partnership.id });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove child");
    },
  });

  const handleAddChild = () => {
    if (!selectedChildId) {
      toast.error("Please select a child");
      return;
    }

    addChildMutation.mutate({
      partnershipId: partnership.id,
      childId: parseInt(selectedChildId),
    });
  };

  const getPersonName = (personId: number) => {
    const person = people.find((p) => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : "Unknown";
  };

  // Filter out partners and already assigned children
  const availableChildren = people.filter(
    (person) =>
      person.id !== partnership.partner1Id &&
      person.id !== partnership.partner2Id &&
      !children?.some((child) => child.id === person.id)
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#2C3E3C]">
            Manage Children
          </DialogTitle>
          <p className="text-sm text-[#5A6B5F]">
            {getPersonName(partnership.partner1Id)} & {getPersonName(partnership.partner2Id)}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Child */}
          <div className="space-y-2">
            <Label>Add Child</Label>
            <div className="flex gap-2">
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {availableChildren.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddChild}
                disabled={!selectedChildId || addChildMutation.isPending}
                className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Children List */}
          <div className="space-y-2">
            <Label>Current Children</Label>
            {children && children.length === 0 ? (
              <p className="text-sm text-[#5A6B5F] py-4 text-center">No children assigned yet</p>
            ) : (
              <div className="space-y-2">
                {children?.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-2 bg-[#F5F5F0] rounded-lg"
                  >
                    <span className="text-sm text-[#2C3E3C]">
                      {child.firstName} {child.lastName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeChildMutation.mutate({
                          partnershipId: partnership.id,
                          childId: child.id,
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
