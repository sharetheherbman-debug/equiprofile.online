import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, CheckCircle, XCircle, LogIn } from "lucide-react";
import { toast } from "sonner";

function useInviteToken() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  return params.get("token") ?? "";
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  trainer: "Trainer",
  member: "Member",
  viewer: "Viewer",
};

export default function StableInviteAccept() {
  const token = useInviteToken();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const inviteQuery = trpc.stables.getInviteByToken.useQuery(
    { token },
    { enabled: !!token, retry: false },
  );

  const acceptMutation = trpc.stables.acceptInvite.useMutation({
    onSuccess: (data) => {
      toast.success("You've joined the stable!");
      navigate(`/stable-dashboard?stable=${data.stableId}`);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to accept invite");
    },
  });

  // If not logged in, redirect to login with the invite URL preserved
  useEffect(() => {
    if (!user && token) {
      const redirectTo = encodeURIComponent(`/stable-invite?token=${token}`);
      navigate(`/login?redirect=${redirectTo}`);
    }
  }, [user, token, navigate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invalid invite link</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              This invite link is missing a token. Please check the email you received.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Loading invite…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteQuery.error) {
    const msg = inviteQuery.error.message ?? "This invite link is invalid or has expired.";
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invite unavailable</h2>
            <p className="text-muted-foreground mb-4 text-sm">{msg}</p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invite = inviteQuery.data!;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-serif">You've been invited</CardTitle>
          <CardDescription>
            You've been invited to join a stable on EquiProfile
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stable</span>
              <span className="font-semibold">{invite.stableName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your role</span>
              <Badge variant="secondary">{ROLE_LABELS[invite.role] ?? invite.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Signed in as</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </div>

          {user.email !== invite.email && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              This invite was sent to <strong>{invite.email}</strong>. You are
              signed in as a different email address. You can still accept, but
              contact your stable admin if you need help.
            </div>
          )}

          <Button
            className="w-full"
            aria-label={`Accept invite and join ${invite.stableName}`}
            onClick={() => acceptMutation.mutate({ token })}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
          Accept &amp; join stable
          </Button>

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Decline — go to my dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
