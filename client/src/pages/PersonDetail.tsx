import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RouteGuard } from "@/components/RouteGuard";
import { useAuthState } from "@/hooks/useAuthState";
import { trpc } from "@/lib/trpc";
import { User, Calendar, MapPin, Heart, Users, Image as ImageIcon, FileText, MessageCircle, Edit2, Trash2, Send } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function PersonDetailContent() {
  const { id } = useParams<{ id: string }>();
  const personId = parseInt(id || "0", 10);
  const auth = useAuthState();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");

  const utils = trpc.useUtils();
  const { data: person, isLoading: personLoading } = trpc.people.getById.useQuery({ id: personId });
  const { data: partnerships } = trpc.partnerships.getForPerson.useQuery({ personId });
  const { data: photos } = trpc.media.getForPerson.useQuery({ personId, category: "photo" });
  const { data: documents } = trpc.media.getForPerson.useQuery({ personId, category: "document" });
  const { data: comments } = trpc.comments.getForPerson.useQuery({ personId });

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getForPerson.invalidate({ personId });
      setCommentBody("");
      toast.success("Comment added");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCommentMutation = trpc.comments.update.useMutation({
    onSuccess: () => {
      utils.comments.getForPerson.invalidate({ personId });
      setEditingCommentId(null);
      setEditingCommentBody("");
      toast.success("Comment updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.getForPerson.invalidate({ personId });
      toast.success("Comment deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAddComment = () => {
    if (!commentBody.trim()) return;
    createCommentMutation.mutate({ personId, body: commentBody.trim() });
  };

  const handleUpdateComment = (commentId: number) => {
    if (!editingCommentBody.trim()) return;
    updateCommentMutation.mutate({ id: commentId, body: editingCommentBody.trim() });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ id: commentId });
    }
  };

  const openLightbox = (images: any[], index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (personLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <p className="text-[#5A6B5F]">Loading...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Alert>
          <AlertDescription>Person not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const photoSlides = photos?.map((p) => ({ src: p.url })) || [];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/directory">
            <Button variant="outline" className="mb-4 border-[#3D5A40] text-[#3D5A40] hover:bg-[#3D5A40] hover:text-white">
              ← Back to Directory
            </Button>
          </Link>
          <h1 className="text-4xl font-serif font-bold text-[#2C3E3C]">
            {person.firstName} {person.lastName}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Infobox */}
          <aside>
            <Card className="polaroid-card sticky top-4">
              <CardContent className="p-6">
                {/* Primary Photo */}
                <div className="aspect-square bg-[#F5F5F0] rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {person.primaryMediaId ? (
                    <img
                      src={`/api/media/${person.primaryMediaId}`}
                      alt={`${person.firstName} ${person.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-24 h-24 text-[#5A6B5F]" />
                  )}
                </div>

                {/* Info */}
                <h2 className="text-2xl font-serif font-bold text-[#2C3E3C] mb-4 text-center">
                  {person.firstName} {person.lastName}
                </h2>

                <div className="space-y-3 text-sm">
                  {person.birthDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#5A6B5F] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#2C3E3C]">Born</p>
                        <p className="text-[#5A6B5F]">
                          {new Date(person.birthDate).toLocaleDateString()}
                          {person.birthPlace && ` in ${person.birthPlace}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {person.deathDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#5A6B5F] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#2C3E3C]">Died</p>
                        <p className="text-[#5A6B5F]">
                          {new Date(person.deathDate).toLocaleDateString()}
                          {person.deathPlace && ` in ${person.deathPlace}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            {person.bioMarkdown && (
              <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                  <CardTitle className="text-[#2C3E3C] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Biography
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{person.bioMarkdown}</ReactMarkdown>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {photos && photos.length > 0 && (
              <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                  <CardTitle className="text-[#2C3E3C] flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Photos ({photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="aspect-square bg-[#F5F5F0] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openLightbox(photos, idx)}
                      >
                        <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {documents && documents.length > 0 && (
              <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                  <CardTitle className="text-[#2C3E3C] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents ({documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="aspect-square bg-[#F5F5F0] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(doc.url, "_blank")}
                      >
                        <img src={doc.url} alt={doc.caption || ""} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Relationships */}
            {partnerships && partnerships.length > 0 && (
              <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                  <CardTitle className="text-[#2C3E3C] flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Relationships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#5A6B5F]">Relationship details coming soon</p>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#2C3E3C] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share a memory or story..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    className="border-[#3D5A40]/20 focus:border-[#3D5A40]"
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={createCommentMutation.isPending || !commentBody.trim()}
                    className="bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                {/* Comments List */}
                {comments && comments.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {comments.map((item) => (
                      <div key={item.comment.id} className="border border-[#3D5A40]/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-[#2C3E3C]">
                              {item.profile?.displayName || item.author.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-[#5A6B5F]">
                              {new Date(item.comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {(auth.user?.id === item.comment.authorUserId || auth.isAdmin) && (
                            <div className="flex gap-2">
                              {auth.user?.id === item.comment.authorUserId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCommentId(item.comment.id);
                                    setEditingCommentBody(item.comment.body);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteComment(item.comment.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {editingCommentId === item.comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingCommentBody}
                              onChange={(e) => setEditingCommentBody(e.target.value)}
                              className="border-[#3D5A40]/20"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateComment(item.comment.id)}
                                disabled={updateCommentMutation.isPending}
                                className="bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentBody("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[#2C3E3C] whitespace-pre-wrap">{item.comment.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#5A6B5F] text-center py-4">No comments yet. Be the first to share a memory!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={photoSlides} index={lightboxIndex} />
    </div>
  );
}

export default function PersonDetail() {
  return (
    <RouteGuard requireAuth requireApproval>
      <PersonDetailContent />
    </RouteGuard>
  );
}
