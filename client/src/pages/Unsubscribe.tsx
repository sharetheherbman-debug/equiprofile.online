import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

/**
 * Public unsubscribe page.
 * URL: /unsubscribe?token=...
 * One-click unsubscribe — no login required (UK GDPR + PECR compliant).
 */
export default function Unsubscribe() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [message, setMessage] = useState("");
  const calledRef = useRef(false);

  const unsubscribeMutation = trpc.marketing.unsubscribe.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("no-token");
      setMessage("No unsubscribe token provided.");
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;
    unsubscribeMutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f2e6b] to-[#4f5fd6] px-8 py-6 text-center">
          <h1 className="text-xl font-bold text-white tracking-wide">EquiProfile</h1>
          <p className="text-xs text-white/70 uppercase tracking-widest mt-1">Professional Equine Management</p>
        </div>

        {/* Body */}
        <div className="px-8 py-10 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-[#4f5fd6] animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Processing your request…</h2>
              <p className="text-sm text-gray-500">Please wait while we update your preferences.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Successfully Unsubscribed</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
              <p className="text-xs text-gray-400 mt-6">
                If you change your mind, you can always sign up again at{" "}
                <a href="https://equiprofile.online" className="text-[#4f5fd6] hover:underline">equiprofile.online</a>
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Something Went Wrong</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
              <p className="text-xs text-gray-400 mt-6">
                Please contact <a href="mailto:support@equiprofile.online" className="text-[#4f5fd6] hover:underline">support@equiprofile.online</a> for help.
              </p>
            </>
          )}

          {status === "no-token" && (
            <>
              <XCircle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Invalid Link</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
              <p className="text-xs text-gray-400 mt-6">
                If you believe this is an error, contact{" "}
                <a href="mailto:support@equiprofile.online" className="text-[#4f5fd6] hover:underline">support@equiprofile.online</a>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} EquiProfile. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
