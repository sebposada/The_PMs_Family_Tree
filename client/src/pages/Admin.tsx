import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { RouteGuard } from "@/components/RouteGuard";
import { trpc } from "@/lib/trpc";
import { Users, UserCheck, User, Image as ImageIcon, MessageCircle, Download, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

function AdminContent() {
  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading } = trpc.stats.get.useQuery();
  const { data: unapprovedUsers, isLoading: usersLoading } = trpc.users.getUnapproved.useQuery();
  const { data: recentComments, isLoading: commentsLoading } = trpc.comments.getRecent.useQuery({ limit: 20 });

  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      utils.users.getUnapproved.invalidate();
      utils.stats.get.invalidate();
      toast.success("User approved successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to approve user");
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.getRecent.invalidate();
      utils.stats.get.invalidate();
      toast.success("Comment deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete comment");
    },
  });

  const handleApprove = (userId: number) => {
    approveMutation.mutate({ userId });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ id: commentId });
    }
  };

  const handleExport = () => {
    // TODO: Implement JSON export
    toast.info("Export feature coming soon");
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-[#2C3E3C]">Admin Dashboard</h1>
          <p className="text-[#5A6B5F] mt-1">Manage users, content, and family archive</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5A6B5F] flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E3C]">
                {statsLoading ? "..." : stats?.totalUsers ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5A6B5F] flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Approved Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E3C]">
                {statsLoading ? "..." : stats?.approvedUsers ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5A6B5F] flex items-center gap-2">
                <User className="w-4 h-4" />
                Total People
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E3C]">
                {statsLoading ? "..." : stats?.totalPeople ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5A6B5F] flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Total Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E3C]">
                {statsLoading ? "..." : stats?.totalPhotos ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#5A6B5F] flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C3E3C]">
                {statsLoading ? "..." : stats?.totalComments ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList className="bg-white border border-[#3D5A40]/10">
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="comments">Recent Comments</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals">
            <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#2C3E3C]">Pending User Approvals</CardTitle>
                <CardDescription className="text-[#5A6B5F]">
                  Review and approve new users to grant them access to the family archive
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-[#5A6B5F]">Loading...</p>
                ) : !unapprovedUsers || unapprovedUsers.length === 0 ? (
                  <Alert>
                    <AlertDescription>No pending approvals</AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unapprovedUsers.map((item) => (
                        <TableRow key={item.user.id}>
                          <TableCell>{item.user.name || "—"}</TableCell>
                          <TableCell>{item.user.email || "—"}</TableCell>
                          <TableCell>{item.profile?.displayName || "—"}</TableCell>
                          <TableCell>{new Date(item.user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(item.user.id)}
                              disabled={approveMutation.isPending}
                              className="bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Comments Tab */}
          <TabsContent value="comments">
            <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#2C3E3C]">Recent Comments</CardTitle>
                <CardDescription className="text-[#5A6B5F]">
                  Monitor and moderate comments across the family archive
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <p className="text-[#5A6B5F]">Loading...</p>
                ) : !recentComments || recentComments.length === 0 ? (
                  <Alert>
                    <AlertDescription>No comments yet</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {recentComments.map((item) => (
                      <div key={item.comment.id} className="border border-[#3D5A40]/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-[#2C3E3C]">
                              {item.profile?.displayName || item.author.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-[#5A6B5F]">
                              On: {item.person.firstName} {item.person.lastName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.comment.createdAt).toLocaleDateString()}
                            </Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteComment(item.comment.id)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-[#2C3E3C]">{item.comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content">
            <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#2C3E3C]">Content Management</CardTitle>
                <CardDescription className="text-[#5A6B5F]">
                  Manage people, partnerships, and media in the family archive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    Content management features coming soon. This will include:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Add, edit, and delete people</li>
                      <li>Manage partnerships and family relationships</li>
                      <li>Bulk upload photos and documents</li>
                      <li>Tag people in photos</li>
                      <li>Set primary photos for people</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#2C3E3C]">Export Data</CardTitle>
                <CardDescription className="text-[#5A6B5F]">
                  Download a complete backup of your family archive data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#5A6B5F] mb-4">
                  Export all family data including people, relationships, media metadata, and comments 
                  as a JSON file. Note: Image files are not included in the export, only their references.
                </p>
                <Button
                  onClick={handleExport}
                  className="bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
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
