import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Paperclip, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";

export default function MessagesPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle message send
      setMessage("");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-8rem)]">
        {/* Threads List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("messages.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("messages.noMessages")}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Select a conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 mb-4">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {t("messages.noMessages")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Messages are available for stable members
                </p>
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder={t("messages.typeMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled
              />
              <Button onClick={handleSendMessage} disabled>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
