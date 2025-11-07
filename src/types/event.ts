// src/types/event.ts
export type EventDoc = {
  id: string;
  title: string;
  time: string;           // e.g., "Tue 6–8 PM"
  location: string;       // e.g., "CS Building"
  description: string;
  category: "events" | "opportunities" | "free-food";
  tags?: string[];        // ["🍕 Free Pizza", "🎤 Q&A"]
  imagePath?: string;     // e.g., "flyers/apple.png" (Storage path)
  likes?: number;
  createdAt?: any;        // Firestore Timestamp
};
