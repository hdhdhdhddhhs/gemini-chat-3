export default function TypingIndicator() {
  return (
    <div className="flex">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 gemini-gradient rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">G</span>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animate-bounce-delayed"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animate-bounce-delayed"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animate-bounce-delayed"></div>
        </div>
      </div>
    </div>
  );
}