import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/chat/sidebar";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Download, Trash2, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ConversationWithMessages, Conversation, Message } from "@shared/schema";

export default function Chat() {
  const { id: conversationId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dark_mode") === "true" || 
             window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("dark_mode", darkMode.toString());
  }, [darkMode]);

  // Fetch conversations list
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch current conversation
  const { data: conversation, isLoading: conversationLoading } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", conversationId],
    enabled: !!conversationId,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = async () => {
    const title = "New Chat";
    createConversationMutation.mutate(title);
  };

  const handleClearChat = () => {
    if (conversationId) {
      deleteConversationMutation.mutate(conversationId);
    }
  };

  const handleSendMessage = async (content: string, targetConversationId?: string) => {
    let actualConversationId = targetConversationId || conversationId;
    
    // If no conversation exists, create one
    if (!actualConversationId) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      const newConversation = await createConversationMutation.mutateAsync(title);
      actualConversationId = newConversation.id;
      // Navigate to the new conversation
      window.history.pushState({}, "", `/chat/${actualConversationId}`);
    }

    if (actualConversationId) {
      sendMessageMutation.mutate({ 
        conversationId: actualConversationId, 
        content 
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        onNewChat={handleNewChat}
        onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
        currentConversationId={conversationId}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 gemini-gradient rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">G</span>
              </div>
              <span className="font-medium">Gemini AI</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} title="Toggle Dark Mode">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={!conversationId}
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Export Chat">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          conversation={conversation}
          loading={conversationLoading}
          sending={sendMessageMutation.isPending}
        />

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}
