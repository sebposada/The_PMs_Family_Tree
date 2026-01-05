import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
import { trpc } from "@/lib/trpc";
import { Clock, LogOut } from "lucide-react";
import { useLocation } from "wouter";

function PendingContent() {
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#3D5A40]/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[#3D5A40]" />
          </div>
          <CardTitle className="text-2xl font-serif text-[#2C3E3C]">Pending Approval</CardTitle>
          <CardDescription className="text-[#5A6B5F]">
            Your account is awaiting administrator approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-[#5A6B5F]">
            Thank you for joining The PMs Family Archive! An administrator will review your 
            account shortly. You'll be able to access the family archive once your account 
            has been approved.
          </p>
          <p className="text-center text-sm text-[#5A6B5F]">
            This helps us keep the archive private and secure for family members only.
          </p>
          <Button
            variant="outline"
            className="w-full border-[#3D5A40] text-[#3D5A40] hover:bg-[#3D5A40] hover:text-white"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Pending() {
  return (
    <RouteGuard requireAuth>
      <PendingContent />
    </RouteGuard>
  );
}
