import fs from "fs";
import path from "path";

// --- Types ---

export interface MediaItem {
  uri: string;
}

export interface Reaction {
  actor: string;
  reaction: string;
}

export interface Message {
  isUnsent: boolean;
  media: MediaItem[];
  reactions: Reaction[];
  senderName: string;
  text: string;
  timestamp: number;
  type: "text" | "media" | "link" | "placeholder";
  shareLink?: string;
}

export interface MessengerExport {
  participants: string[];
  threadName: string;
  messages: Message[];
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  label: string; // human-readable
  count: number;
}

export interface MessageWithId extends Message {
  id: number; // index in the array, used as stable ID
}

// --- Data Loading ---

let cachedData: MessengerExport | null = null;

/**
 * Facebook Messenger exports encode text as UTF-8 bytes stored in latin1.
 * This function decodes those mangled strings back to proper UTF-8.
 */
function decodeFBString(str: string): string {
  try {
    // Convert each character code (latin1 byte) back to a byte,
    // then decode the resulting byte sequence as UTF-8
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return str;
  }
}

function fixMessageEncoding(msg: Message): Message {
  return {
    ...msg,
    text: msg.text ? decodeFBString(msg.text) : msg.text,
    senderName: decodeFBString(msg.senderName),
    reactions: msg.reactions.map((r) => ({
      actor: decodeFBString(r.actor),
      reaction: decodeFBString(r.reaction),
    })),
  };
}

function loadData(): MessengerExport {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "jose-burgos.json");
  const raw = fs.readFileSync(filePath, "latin1");
  const parsed = JSON.parse(raw) as MessengerExport;

  // Fix encoding on all messages
  parsed.messages = parsed.messages.map(fixMessageEncoding);
  parsed.participants = parsed.participants.map(decodeFBString);

  cachedData = parsed;
  return cachedData;
}

function withIds(messages: Message[]): MessageWithId[] {
  const allMessages = loadData().messages;
  return messages.map((msg) => ({
    ...msg,
    id: allMessages.indexOf(msg),
  }));
}

// --- Query Functions ---

export function getAllMessages(): MessageWithId[] {
  const data = loadData();
  return data.messages.map((msg, i) => ({ ...msg, id: i }));
}

export function getMessagesPaginated(
  page: number,
  pageSize: number = 50,
  fromDate?: string,
  toDate?: string
): { messages: MessageWithId[]; total: number; page: number; pageSize: number } {
  let msgs = getAllMessages();

  if (fromDate) {
    const from = new Date(fromDate).getTime();
    msgs = msgs.filter((m) => m.timestamp >= from);
  }
  if (toDate) {
    const to = new Date(toDate).getTime() + 86400000; // end of day
    msgs = msgs.filter((m) => m.timestamp < to);
  }

  const total = msgs.length;
  const start = page * pageSize;
  const slice = msgs.slice(start, start + pageSize);

  return { messages: slice, total, page, pageSize };
}

export function getMessagesByDate(date: string): MessageWithId[] {
  const dayStart = new Date(date).getTime();
  const dayEnd = dayStart + 86400000;
  return getAllMessages().filter(
    (m) => m.timestamp >= dayStart && m.timestamp < dayEnd
  );
}

export function searchMessages(
  query: string,
  fromDate?: string,
  toDate?: string
): MessageWithId[] {
  const q = query.toLowerCase();
  let msgs = getAllMessages();

  if (fromDate) {
    const from = new Date(fromDate).getTime();
    msgs = msgs.filter((m) => m.timestamp >= from);
  }
  if (toDate) {
    const to = new Date(toDate).getTime() + 86400000;
    msgs = msgs.filter((m) => m.timestamp < to);
  }

  return msgs.filter(
    (m) => m.text && m.text.toLowerCase().includes(q)
  );
}

export function getMessagesGroupedByDay(): Map<string, MessageWithId[]> {
  const groups = new Map<string, MessageWithId[]>();
  const msgs = getAllMessages();

  for (const msg of msgs) {
    const date = new Date(msg.timestamp);
    const key = date.toISOString().split("T")[0];
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(msg);
  }

  return groups;
}

export function getDaySummaries(): DaySummary[] {
  const groups = getMessagesGroupedByDay();
  const summaries: DaySummary[] = [];

  for (const [dateStr, msgs] of groups) {
    const date = new Date(dateStr + "T12:00:00");
    summaries.push({
      date: dateStr,
      label: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      count: msgs.length,
    });
  }

  return summaries;
}

/**
 * Resolve a media URI from the JSON (e.g. "./media/uuid.jpeg")
 * to a public URL path (e.g. "/media/uuid.jpeg")
 */
export function resolveMediaUri(uri: string): string {
  // Strip leading "./" to get "media/uuid.jpeg", then prefix with "/"
  return "/" + uri.replace(/^\.\//, "");
}
