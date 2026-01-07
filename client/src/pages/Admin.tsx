import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteGuard } from "@/components/RouteGuard";
import { trpc } from "@/lib/trpc";
import { Check, Download, Image as ImageIcon, MessageSquare, Users, User } from "lucide-react";
import { toast } from "sonner";
import { PeopleManagement } from "@/components/admin/PeopleManagement";
import { PartnershipsManagement } from "@/components/admin/PartnershipsManagement";
import { MediaManagement } from "@/components/admin/MediaManagement";

function AdminContent() {
  const { data: stats, isLoading: statsLoading } = trpc.stats.get.useQuery();
  const { data: unapprovedUsers } = trpc.users.getUnapproved.useQuery();
  const { data: recentComments } = trpc.comments.getRecent.useQuery({ limit: 10 });

  const utils = trpc.useUtils();
  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      toast.success("User approved successfully");
      utils.users.getUnapproved.invalidate();
      utils.stats.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve user");
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      utils.comments.getRecent.invalidate();
      utils.stats.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handleExport = async () => {
    try {
      // Fetch all data
      const people = await utils.client.people.getAll.query();
      const partnerships = await utils.client.partnerships.getAll.query();
      const media = await utils.client.media.getAll.query();
      const users = await utils.client.users.getAll.query();

      const exportData = {
        exportDate: new Date().toISOString(),
        people,
        partnerships,
        media: media.map((m) => ({
          ...m,
          note: "Download actual files from S3 using the fileKey",
        })),
        users: users.map((u) => ({
          id: u.user.id,
          email: u.user.email,
          name: u.user.name,
          role: u.user.role,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `family-archive-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#FAF9F6]">
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#2C3E3C] mb-2">Admin Dashboard</h1>
            <p className="text-[#5A6B5F]">Manage users, content, and family data</p>
          </div>

          {/* Stats */}
          {statsLoading ? (
            <div className="text-center py-8 text-[#5A6B5F]">Loading stats...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3D5A40]/10 rounded-lg">
                      <Users className="w-6 h-6 text-[#3D5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#5A6B5F]">Total Users</p>
                      <p className="text-2xl font-serif font-bold text-[#2C3E3C]">
                        {stats?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3D5A40]/10 rounded-lg">
                      <User className="w-6 h-6 text-[#3D5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#5A6B5F]">Total People</p>
                      <p className="text-2xl font-serif font-bold text-[#2C3E3C]">
                        {stats?.totalPeople || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3D5A40]/10 rounded-lg">
                      <ImageIcon className="w-6 h-6 text-[#3D5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#5A6B5F]">Total Photos</p>
                      <p className="text-2xl font-serif font-bold text-[#2C3E3C]">
                        {stats?.totalPhotos || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3D5A40]/10 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-[#3D5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#5A6B5F]">Total Comments</p>
                      <p className="text-2xl font-serif font-bold text-[#2C3E3C]">
                        {stats?.totalComments || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="approvals" className="space-y-6">
            <TabsList className="bg-white border border-[#3D5A40]/10">
              <TabsTrigger value="approvals">User Approvals</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            {/* User Approvals Tab */}
            <TabsContent value="approvals">
              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-bold text-[#2C3E3C] mb-4">
                    Pending User Approvals
                  </h2>
                  {unapprovedUsers && unapprovedUsers.length === 0 ? (
                    <p className="text-center py-8 text-[#5A6B5F]">No pending approvals</p>
                  ) : (
                    <div className="space-y-3">
                      {unapprovedUsers?.map((item) => (
                        <div
                          key={item.user.id}
                          className="flex items-center justify-between p-4 bg-[#F5F5F0] rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-[#2C3E3C]">
                              {item.profile?.displayName || "No name"}
                            </p>
                            <p className="text-sm text-[#5A6B5F]">{item.user.email}</p>
                          </div>
                          <Button
                            onClick={() => approveMutation.mutate({ userId: item.user.id })}
                            disabled={approveMutation.isPending}
                            className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* People Management Tab */}
            <TabsContent value="people">
              <PeopleManagement />
            </TabsContent>

            {/* Partnerships Management Tab */}
            <TabsContent value="partnerships">
              <PartnershipsManagement />
            </TabsContent>

            {/* Media Management Tab */}
            <TabsContent value="media">
              <MediaManagement />
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments">
              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-bold text-[#2C3E3C] mb-4">
                    Recent Comments
                  </h2>
                  {recentComments && recentComments.length === 0 ? (
                    <p className="text-center py-8 text-[#5A6B5F]">No comments yet</p>
                  ) : (
                    <div className="space-y-4">
                      {recentComments?.map((item) => (
                        <div
                          key={item.comment.id}
                          className="p-4 bg-[#F5F5F0] rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-[#5A6B5F]">
                                By <strong>{item.profile?.displayName || item.author.name || "Unknown"}</strong> on{" "}
                                <strong>
                                  {item.person.firstName} {item.person.lastName}
                                </strong>
                              </p>
                              <p className="text-[#2C3E3C] mt-1">{item.comment.body}</p>
                              <p className="text-xs text-[#5A6B5F] mt-1">
                                {new Date(item.comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCommentMutation.mutate({ id: item.comment.id })}
                              className="text-[#8B4513] hover:text-[#6B3410] hover:bg-[#8B4513]/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export">
              <Card className="polaroid-card">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif font-bold text-[#2C3E3C] mb-4">
                    Export Data
                  </h2>
                  <p className="text-[#5A6B5F] mb-6">
                    Download all family archive data as a JSON file. This includes people,
                    partnerships, media metadata, and user information. Note: Actual photo files
                    must be downloaded separately from S3 using the file keys.
                  </p>
                  <Button
                    onClick={handleExport}
                    className="bg-[#3D5A40] hover:bg-[#2C3E3C]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}

export default function Admin() {
  return (
    <RouteGuard requireAuth requireApproval requireAdmin>
      <AdminContent />
    </RouteGuard>
  );
}
