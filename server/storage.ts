import { type Conversation, type Message, type InsertConversation, type InsertMessage, type ConversationWithMessages } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<ConversationWithMessages | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  deleteConversation(id: string): Promise<boolean>;
  
  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConversation(id: string): Promise<ConversationWithMessages | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const messages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      ...conversation,
      messages,
    };
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    // Delete all messages in the conversation
    Array.from(this.messages.entries())
      .filter(([, message]) => message.conversationId === id)
      .forEach(([messageId]) => this.messages.delete(messageId));
    
    return this.conversations.delete(id);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
