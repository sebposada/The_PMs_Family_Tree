import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
import { BookOpen } from "lucide-react";

function AboutContent() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-[#2C3E3C]">About</h1>
          <p className="text-[#5A6B5F] mt-1">Learn about The PMs Family Archive</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#3D5A40]/10 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#3D5A40]" />
              </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#2C3E3C] mb-4 text-center">
              The PMs Family Archive
            </h2>

            <div className="prose prose-sm max-w-none text-[#2C3E3C] space-y-4">
              <p>
                Welcome to The PMs Family Archive, a private digital space dedicated to preserving 
                and celebrating our family's rich history, stories, and memories.
              </p>

              <p>
                This archive serves as a living repository of our family tree, biographical 
                information, photographs, and shared memories. It's a place where past and present 
                generations can connect, where stories are preserved, and where our family legacy 
                continues to grow.
              </p>

              <h3 className="text-xl font-serif font-semibold text-[#2C3E3C] mt-6 mb-3">
                Our Mission
              </h3>

              <p>
                To create a warm, accessible, and secure space where family members can explore 
                their heritage, share memories, and strengthen the bonds that connect us across 
                generations.
              </p>

              <h3 className="text-xl font-serif font-semibold text-[#2C3E3C] mt-6 mb-3">
                Privacy & Security
              </h3>

              <p>
                This archive is completely private and accessible only to approved family members. 
                All new users must be verified and approved by an administrator before gaining 
                access to the content.
              </p>

              <p className="text-[#5A6B5F] text-sm mt-8 text-center">
                For questions or to request changes to your profile, please contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function About() {
  return (
    <RouteGuard requireAuth requireApproval>
      <AboutContent />
    </RouteGuard>
  );
}
