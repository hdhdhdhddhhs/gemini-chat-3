import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 96; // 4 rows * 24px line height
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = newHeight + "px";
    }
  }, [message]);

  return (
    <div className="bg-card border-t border-border px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Message Gemini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none border-2 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent min-h-[48px] max-h-24"
              rows={1}
              disabled={disabled}
            />
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              size="sm"
              className="absolute right-2 bottom-2 w-8 h-8 rounded-full p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-3 text-muted-foreground hover:text-foreground"
            title="Voice Input"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-3 text-muted-foreground hover:text-foreground"
            title="Attach File"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          Gemini may display inaccurate info, including about people, so double-check its responses.
          <span className="text-primary hover:underline cursor-pointer ml-1">Privacy</span>
        </div>
      </div>
    </div>
  );
}