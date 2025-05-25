import { ApiClient } from '@/lib/api-client';

export interface ChatApiConfig {
  baseUrl?: string;
}

interface MessageRequest {
  userId: string;
  sender: string;
  content: string;
}

interface AiResponse {
  response: string;
}

interface AttachmentResponse {
  name: string;
  url: string;
}

export class ChatService {
  private api: ApiClient;

  constructor(config?: ChatApiConfig) {
    this.api = new ApiClient(config?.baseUrl);
  }

  async sendMessage(userId: string, sender: string, content: string) {
    return this.api.post<void>('/api/chathub/sendmessage', {
      userId,
      sender,
      content,
    });
  }

  async uploadAttachment(file: File, userId: string, sender: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('sender', sender);

    return this.api.upload<AttachmentResponse>('/api/chathub/sendattachments', formData);
  }

  async loadChatHistory(userId: string) {
    return this.api.get(`/api/chat/${userId}`);
  }

  async askAi(prompt: string) {
    return this.api.post<AiResponse>('/api/ai/ask', { prompt });
  }
}