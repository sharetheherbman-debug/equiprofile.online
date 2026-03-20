import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useState, FormEvent } from "react";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Login page
 *
 * Step 1: Email input
 * Step 2: Password input + submit
 */
export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleEmailStep = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setStep(2);
  };

  const handleChangeEmail = () => {
    setStep(1);
    setError("");
  };

  const handlePasswordStep = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
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
      <Navbar alwaysDark />
      <PageTransition>
        <AuthSplitLayout>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to home</span>
            </Link>

            {/* Login Form Card */}
            <Card className="bg-[#0a1628]/70 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="space-y-3 pb-2">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-gradient-to-r from-indigo-500 to-cyan-500" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-gradient-to-r from-indigo-500 to-cyan-500" : "bg-white/10"}`}
                  />
                </div>

                <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-center text-gray-400">
                  {step === 1
                    ? "Enter your email to continue"
                    : "Enter your password to sign in"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      variant="destructive"
                      className="bg-red-950/50 border-red-500/50 backdrop-blur-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.form
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleEmailStep}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-white/20 h-12 text-base transition-all duration-200 pl-10"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-12 text-base"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handlePasswordStep}
                      className="space-y-4"
                    >
                      {/* Show selected email */}
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-300 truncate">
                          {email}
                        </span>
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-white">
                            Password
                          </Label>
                          <Link
                            href="/forgot-password"
                            className="text-sm bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-cyan-300 transition-all duration-200"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            autoFocus
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-white/20 h-12 text-base transition-all duration-200 pl-10"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-12 text-base"
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
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0a1628]/60 px-2 text-gray-400">
                      Or
                    </span>
                  </div>
                </div>

                {/* Register link */}
                <div className="text-center text-sm">
                  <span className="text-gray-400">Don't have an account? </span>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-medium hover:from-indigo-300 hover:to-cyan-300 transition-all duration-200"
                  >
                    Create account
                  </Link>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-gray-500 mt-4">
              Secure email/password authentication
            </p>
          </motion.div>
        </AuthSplitLayout>
      </PageTransition>
    </>
  );
}
