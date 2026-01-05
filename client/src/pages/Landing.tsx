import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useAuthState } from "@/hooks/useAuthState";
import { BookOpen, Users, Image, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const auth = useAuthState();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (auth.isAuthenticated && !auth.loading) {
      if (auth.needsOnboarding) {
        setLocation("/onboarding");
      } else if (!auth.isApproved) {
        setLocation("/pending");
      } else {
        setLocation("/directory");
      }
    }
  }, [auth, setLocation]);

  if (auth.loading || auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-[#2C3E3C]">The PMs Family Archive</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = getLoginUrl()}
              className="border-[#3D5A40] text-[#3D5A40] hover:bg-[#3D5A40] hover:text-white"
            >
              Log In
            </Button>
            <Button 
              onClick={() => setLocation("/signup")}
              className="bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-serif font-bold text-[#2C3E3C] mb-6">
            Preserve Your Family Legacy
          </h2>
          <p className="text-xl text-[#5A6B5F] max-w-2xl mx-auto mb-12">
            A private, warm space to store your family tree, share stories, preserve memories, 
            and connect generations through photos and cherished moments.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation("/signup")}
              className="bg-[#3D5A40] hover:bg-[#2C3E3C] text-white text-lg px-8 py-6"
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = getLoginUrl()}
              className="border-[#3D5A40] text-[#3D5A40] hover:bg-[#3D5A40] hover:text-white text-lg px-8 py-6"
            >
              Log In
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#3D5A40]/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#3D5A40]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2C3E3C] mb-2">Family Tree</h3>
              <p className="text-[#5A6B5F]">
                Interactive family tree with zoom, pan, and search to explore your family connections.
              </p>
            </Card>

            <Card className="p-6 bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#3D5A40]/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[#3D5A40]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2C3E3C] mb-2">Life Stories</h3>
              <p className="text-[#5A6B5F]">
                Rich biographical pages with photos, documents, and stories for each family member.
              </p>
            </Card>

            <Card className="p-6 bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#3D5A40]/10 flex items-center justify-center mb-4">
                <Image className="w-6 h-6 text-[#3D5A40]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2C3E3C] mb-2">Photo Archive</h3>
              <p className="text-[#5A6B5F]">
                Organize and search through family photos with captions and tagged family members.
              </p>
            </Card>

            <Card className="p-6 bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#3D5A40]/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#3D5A40]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2C3E3C] mb-2">Family Comments</h3>
              <p className="text-[#5A6B5F]">
                Share memories and stories through comments on family member pages.
              </p>
            </Card>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="p-12 bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-center">
            <h3 className="text-3xl font-serif font-bold text-[#2C3E3C] mb-4">
              Private & Secure
            </h3>
            <p className="text-lg text-[#5A6B5F] max-w-2xl mx-auto">
              Your family archive is completely private. All members must be approved by an administrator 
              before they can view any content. Your memories stay within the family.
            </p>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-[#5A6B5F]">
          <p>&copy; {new Date().getFullYear()} The PMs Family Archive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
