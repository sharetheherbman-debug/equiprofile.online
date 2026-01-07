import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getLoginUrl, isOAuthAvailable } from "@/const";
import { Link, useLocation } from "wouter";
import { useState, FormEvent } from "react";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { MarketingNav } from "@/components/MarketingNav";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Register page
 * 
 * Supports both OAuth (if configured) and email/password registration.
 */
export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const oauthEnabled = isOAuthAvailable();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleOAuthRegister = () => {
    const loginUrl = getLoginUrl();
    if (!loginUrl) {
      setError("OAuth is not configured");
      return;
    }
    setIsLoading(true);
    window.location.href = loginUrl;
  };

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!acceptTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
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

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 pt-20">
          <div className="w-full max-w-md">
            {/* Back button */}
            <Link href="/">
              <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </a>
            </Link>

            <Card className="shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Create an account
                </CardTitle>
                <CardDescription className="text-center">
                  Get started with EquiProfile today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleEmailRegister} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      At least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Terms acceptance */}
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="terms" 
                      className="mt-1"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal cursor-pointer leading-relaxed"
                    >
                      I agree to the{" "}
                      <Link href="/terms">
                        <a className="text-primary hover:underline">
                          Terms of Service
                        </a>
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy">
                        <a className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </Link>
                    </Label>
                  </div>

                  {/* Create account button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>

                {/* OAuth option if available */}
                {oauthEnabled && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleOAuthRegister}
                      disabled={isLoading}
                    >
                      OAuth Sign Up
                    </Button>
                  </>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Login link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                  </span>
                  <Link href="/login">
                    <a className="text-primary font-medium hover:underline">
                      Sign in
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              {oauthEnabled 
                ? "Secure authentication with OAuth or email/password" 
                : "Secure email/password authentication"}
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Start your <strong>7-day free trial</strong> - no credit card required
            </p>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
