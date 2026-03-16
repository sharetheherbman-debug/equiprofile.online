import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Mic,
  MicOff,
  Save,
  Trash2,
  Plus,
  MessageSquare,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are the EquiProfile bot, an expert in horse care, training, and management.",
    },
  ]);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [adminStatus, setAdminStatus] = useState<{
    isUnlocked: boolean;
    expiresAt?: Date;
  }>({ isUnlocked: false });

  // Notes functionality
  const [isListening, setIsListening] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const recognitionRef = useRef<any>(null);

  const { data: notes, refetch: refetchNotes } = trpc.notes.list.useQuery({
    limit: 50,
  });

  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      toast.success("Note saved successfully!");
      setNoteContent("");
      setNoteTitle("");
      refetchNotes();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save note");
    },
  });

  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      toast.success("Note deleted");
      refetchNotes();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete note");
    },
  });

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }
        if (finalTranscript) {
          setNoteContent((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast.error(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      toast.error("Note content is required");
      return;
    }

    createNote.mutate({
      title: noteTitle.trim() || undefined,
      content: noteContent.trim(),
      transcribed: isListening || noteContent.includes("[Voice]"),
    });
  };

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response: any) => {
      setMessages((prev) => [...prev, response]);

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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ **Admin mode unlocked!**\n\nYou now have full admin access until ${new Date(data.expiresAt).toLocaleString()}.\n\n👉 The **[Open Admin Panel]** button has appeared in the top right — click it to access user management, system settings, API keys, and more.`,
        },
      ]);
      toast.success("Admin mode unlocked successfully!");
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${error.message}`,
        },
      ]);
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

  /** Matches "show admin" and "show afmin" (common typo) — stealth command */
  const ADMIN_COMMAND_PATTERN = /^show\s+(admin|afmin)\b/i;

  const handleSend = (content: string) => {
    // Stealth intercept: if the message matches the admin command, do NOT
    // add it to the chat transcript and do NOT send it to the backend.
    // Instead, silently open the password prompt.
    if (ADMIN_COMMAND_PATTERN.test(content.trim())) {
      setShowPasswordInput(true);
      return;
    }
    const newMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, newMessage]);
    chatMutation.mutate({ messages: [...messages, newMessage] });
  };

  const handlePasswordSubmit = () => {
    if (password.trim()) {
      unlockMutation.mutate({ password });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Assistant & Notes</h1>
          {adminStatus.isUnlocked && (
            <div className="flex items-center gap-3">
              <Alert className="w-auto border-green-500/50 bg-green-500/10">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Admin unlocked until{" "}
                  {adminStatus.expiresAt &&
                    new Date(adminStatus.expiresAt).toLocaleTimeString()}
                </AlertDescription>
              </Alert>
              <a href="/admin">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Admin Panel
                </Button>
              </a>
            </div>
          )}
        </div>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="w-4 h-4 mr-2" />
              Voice Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardContent className="p-6">
                <AIChatBox
                  messages={messages}
                  onSendMessage={handleSend}
                  isLoading={chatMutation.isPending}
                  placeholder="Ask about horse care, training, or management..."
                  height="600px"
                  suggestedPrompts={[
                    "What can you help me with?",
                    "Show me horse care tips",
                    "How do I track vaccinations?",
                  ]}
                />

                {showPasswordInput && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4" />
                      <span className="font-semibold">
                        Admin Password Required
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handlePasswordSubmit()
                        }
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
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Voice Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Title (optional)</Label>
                  <Input
                    id="note-title"
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Start dictating or type here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "default"}
                    disabled={!recognitionRef.current}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Voice Dictation
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    disabled={createNote.isPending || !noteContent.trim()}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNoteContent("");
                      setNoteTitle("");
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {!recognitionRef.current && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Voice recognition is not supported in your browser. You
                      can still type notes manually.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {notes && notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <Card key={note.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {note.title && (
                              <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                                {note.transcribed && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Mic className="w-3 h-3 mr-1" />
                                    Voice
                                  </Badge>
                                )}
                                {note.title}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {note.content}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(note.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNote.mutate({ id: note.id })}
                            disabled={deleteNote.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notes yet. Create your first note above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
