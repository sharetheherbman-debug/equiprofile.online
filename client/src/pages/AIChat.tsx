import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are EquiProfile AI Assistant, an expert in horse care, training, and management." },
  ]);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [adminStatus, setAdminStatus] = useState<{
    isUnlocked: boolean;
    expiresAt?: Date;
  }>({ isUnlocked: false });

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response: any) => {
      setMessages(prev => [...prev, response]);
      
      // Check if this is an admin challenge
      if (response.metadata?.adminChallenge) {
        setShowPasswordInput(true);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unlockMutation = trpc.adminUnlock.submitPassword.useMutation({
    onSuccess: (data) => {
      setShowPasswordInput(false);
      setPassword("");
      setAdminStatus({ isUnlocked: true, expiresAt: data.expiresAt });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ **Admin mode unlocked!**\n\nYou now have full admin access until ${new Date(data.expiresAt).toLocaleString()}.\n\nNavigate to the Admin panel to manage users, system settings, and more.`,
      }]);
      toast.success("Admin mode unlocked successfully!");
    },
    onError: (error: any) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ ${error.message}`,
      }]);
      setPassword("");
      toast.error(error.message);
    },
  });

  const statusQuery = trpc.adminUnlock.getStatus.useQuery(undefined, {
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (statusQuery.data) {
      setAdminStatus(statusQuery.data);
    }
  }, [statusQuery.data]);

  const handleSend = (content: string) => {
    const newMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, newMessage]);
    chatMutation.mutate({ messages: [...messages, newMessage] });
  };

  const handlePasswordSubmit = () => {
    if (password.trim()) {
      unlockMutation.mutate({ password });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          {adminStatus.isUnlocked && (
            <Alert className="w-auto">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                Admin unlocked until {adminStatus.expiresAt && new Date(adminStatus.expiresAt).toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              placeholder="Type your message... (Try 'show admin')"
              height="600px"
              suggestedPrompts={[
                "What can you help me with?",
                "Show me horse care tips",
                "show admin",
              ]}
            />

            {showPasswordInput && (
              <div className="mt-4 p-4 border rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4" />
                  <span className="font-semibold">Admin Password Required</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    disabled={unlockMutation.isPending}
                  />
                  <Button 
                    onClick={handlePasswordSubmit}
                    disabled={unlockMutation.isPending || !password.trim()}
                  >
                    Unlock
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
