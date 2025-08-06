import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, Code, Map, Lightbulb, PenTool } from "lucide-react";
import TypingIndicator from "./typing-indicator";
import type { ConversationWithMessages } from "@shared/schema";

interface MessageListProps {
  conversation?: ConversationWithMessages;
  loading: boolean;
  sending: boolean;
}

export default function MessageList({ conversation, loading, sending }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, sending]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const samplePrompts = [
    {
      icon: Code,
      title: "Explain concepts",
      subtitle: "Break down complex topics",
      prompt: "Explain quantum computing in simple terms",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Code,
      title: "Write code", 
      subtitle: "Generate and debug programs",
      prompt: "Write a Python function to sort a list",
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
    },
    {
      icon: Map,
      title: "Plan activities",
      subtitle: "Organize trips and events", 
      prompt: "Plan a 7-day trip to Japan",
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
    },
    {
      icon: PenTool,
      title: "Create content",
      subtitle: "Draft emails and documents",
      prompt: "Help me write a professional email",
      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
    }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-muted/20">
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        {!conversation?.messages?.length ? (
          // Welcome Screen
          <div className="text-center py-12">
            <div className="w-16 h-16 gemini-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Gemini Chat</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start a conversation with Google's most capable AI model. Ask me anything!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {samplePrompts.map((prompt, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:border-primary transition-colors group"
                  onClick={() => {
                    const input = document.querySelector('textarea') as HTMLTextAreaElement;
                    if (input) {
                      input.value = prompt.prompt;
                      input.focus();
                      // Trigger input event to enable send button
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${prompt.color}`}>
                      <prompt.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {prompt.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-6">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 gemini-gradient rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">G</span>
                    </div>
                  </div>
                )}

                <div className="max-w-xs lg:max-w-2xl">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  <div className={`flex items-center space-x-2 mt-1 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </span>
                    {message.role === "assistant" && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(message.content)}
                          title="Copy"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Like">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Dislike">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">U</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {sending && <TypingIndicator />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}