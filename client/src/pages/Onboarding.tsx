import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RouteGuard } from "@/components/RouteGuard";
import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

function OnboardingContent() {
  const [, setLocation] = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  
  const utils = trpc.useUtils();
  const setDisplayNameMutation = trpc.auth.setDisplayName.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/pending");
    },
    onError: (err) => {
      setError(err.message || "Failed to set display name");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setDisplayNameMutation.mutate({ displayName: displayName.trim() });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-[#2C3E3C]">Welcome!</CardTitle>
          <CardDescription className="text-[#5A6B5F]">
            Let's get you set up. How would you like to be called?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-[#2C3E3C]">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., John Smith"
                className="border-[#3D5A40]/20 focus:border-[#3D5A40]"
                required
                autoFocus
              />
              <p className="text-sm text-[#5A6B5F]">
                This is how your name will appear in comments and throughout the site.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
              disabled={setDisplayNameMutation.isPending}
            >
              {setDisplayNameMutation.isPending ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Onboarding() {
  return (
    <RouteGuard requireAuth>
      <OnboardingContent />
    </RouteGuard>
  );
}
