import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Plus, Settings, Moon, Sun, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Conversation } from "@shared/schema";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  currentConversationId?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({
  open,
  onClose,
  conversations,
  onNewChat,
  onDeleteConversation,
  currentConversationId,
  darkMode,
  onToggleDarkMode,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gemini-gradient rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <h1 className="text-lg font-semibold">Gemini Chat</h1>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start"
          variant="outline"
        >
          <Plus className="mr-3 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 px-3">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Recent Conversations
        </h3>
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group flex items-center space-x-1"
              >
                <Link
                  to={`/chat/${conversation.id}`}
                  className={`flex-1 text-left px-3 py-2 text-sm rounded-lg truncate transition-colors ${
                    currentConversationId === conversation.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                  onClick={isMobile ? onClose : undefined}
                >
                  {conversation.title}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteConversation(conversation.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No conversations yet. Start a new chat to begin!
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            className="flex items-center space-x-2"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-sm">{darkMode ? "Light" : "Dark"}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <SidebarContent />
    </div>
  );
}