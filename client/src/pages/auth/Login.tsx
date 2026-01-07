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
 * Login page
 * 
 * Supports both OAuth (if configured) and email/password authentication.
 */
export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const oauthEnabled = isOAuthAvailable();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleOAuthLogin = () => {
    const loginUrl = getLoginUrl();
    if (!loginUrl) {
      setError("OAuth is not configured");
      return;
    }
    setIsLoading(true);
    window.location.href = loginUrl;
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
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
                  Welcome back
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in to your EquiProfile account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link href="/forgot-password">
                      <a className="text-sm text-primary hover:underline">
                        Forgot password?
                      </a>
                    </Link>
                  </div>

                  {/* Sign in button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
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
                      onClick={handleOAuthLogin}
                      disabled={isLoading}
                    >
                      OAuth Sign In
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

                {/* Register link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Don't have an account?{" "}
                  </span>
                  <Link href="/register">
                    <a className="text-primary font-medium hover:underline">
                      Create account
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
          </div>
        </div>
      </PageTransition>
    </>
  );
}
