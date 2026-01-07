import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useState, FormEvent } from "react";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { MarketingNav } from "@/components/MarketingNav";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
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
            <Link href="/login">
              <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </a>
            </Link>

            <Card className="shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Forgot password?
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your email and we'll send you a reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Check your email</h3>
                      <p className="text-sm text-muted-foreground">
                        If an account exists with that email, we've sent password reset instructions.
                      </p>
                    </div>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Back to login
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
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

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send reset link"
                      )}
                    </Button>

                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">
                        Remember your password?{" "}
                      </span>
                      <Link href="/login">
                        <a className="text-primary font-medium hover:underline">
                          Sign in
                        </a>
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
