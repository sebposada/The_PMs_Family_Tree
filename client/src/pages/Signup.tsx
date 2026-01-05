import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// TODO: Replace with actual Cloudflare Turnstile site key
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA"; // This is a test key that always passes

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual signup with backend verification
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#3D5A40]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#3D5A40]" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#2C3E3C]">Check Your Email</CardTitle>
            <CardDescription className="text-[#5A6B5F]">
              We've sent a verification link to <strong>{email}</strong>. 
              Please verify your email before logging in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
              onClick={() => setLocation("/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#3D5A40]/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-[#2C3E3C]">Create Account</CardTitle>
          <CardDescription className="text-[#5A6B5F]">
            Join The PMs Family Archive
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
              <Label htmlFor="email" className="text-[#2C3E3C]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="border-[#3D5A40]/20 focus:border-[#3D5A40]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2C3E3C]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="border-[#3D5A40]/20 focus:border-[#3D5A40]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#2C3E3C]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="border-[#3D5A40]/20 focus:border-[#3D5A40]"
                required
              />
            </div>

            <div className="flex justify-center py-2">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3D5A40] hover:bg-[#2C3E3C] text-white"
              disabled={loading || !captchaToken}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-[#5A6B5F]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="text-[#3D5A40] hover:underline font-medium"
              >
                Log in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
