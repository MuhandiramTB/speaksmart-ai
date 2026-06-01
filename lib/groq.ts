import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getGroq(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not set. Add it to .env.local — get a free key at https://console.groq.com"
      );
    }
    _client = new Groq({ apiKey });
  }
  return _client;
}

export const MODEL_CHAT = "llama-3.3-70b-versatile";
export const MODEL_STT = "whisper-large-v3";
