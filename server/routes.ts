import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get a specific conversation with messages
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  // Delete a conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteConversation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Send a message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { content } = req.body;
      const conversationId = req.params.id;

      if (!content?.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Validate conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: content.trim(),
      });

      // Get conversation history for context
      const messages = await storage.getMessages(conversationId);
      const conversationHistory = messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        parts: [{ text: msg.content }]
      }));

      try {
        // Call Gemini API
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: conversationHistory,
        });

        const aiResponse = response.text || "I'm sorry, I couldn't generate a response.";

        // Save AI response
        const assistantMessage = await storage.createMessage({
          conversationId,
          role: "assistant", 
          content: aiResponse,
        });

        res.json({
          userMessage,
          assistantMessage,
        });

      } catch (aiError) {
        console.error("Gemini API error:", aiError);
        
        // Save error message
        const errorMessage = await storage.createMessage({
          conversationId,
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later.",
        });

        res.status(500).json({
          message: "Failed to get AI response",
          userMessage,
          assistantMessage: errorMessage,
        });
      }

    } catch (error) {
      console.error("Message handling error:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
