"use client";

import ReactionBadge from "./ReactionBadge";

interface MediaItem {
  uri: string;
}

interface Reaction {
  actor: string;
  reaction: string;
}

interface MessageProps {
  id: number;
  senderName: string;
  text: string;
  timestamp: number;
  type: "text" | "media" | "link" | "placeholder";
  media: MediaItem[];
  reactions: Reaction[];
  isUnsent: boolean;
  shareLink?: string;
  highlight?: string;
}

function resolveMediaUri(uri: string): string {
  // If already a full URL (R2), use as-is; otherwise resolve locally
  if (uri.startsWith("http")) return uri;
  return "/" + uri.replace(/^\.\//, "");
}

function getFileExtension(uri: string): string {
  return uri.split(".").pop()?.toLowerCase() || "";
}

/**
 * Extract the first URL from a string, or return undefined.
 */
function extractUrl(str: string): string | undefined {
  const match = str.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : undefined;
}

export default function Message({
  senderName,
  text,
  timestamp,
  type,
  media,
  reactions,
  isUnsent,
  shareLink,
  highlight,
}: MessageProps) {
  const isMark = senderName === "Mark Cody";
  const time = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Highlight search matches in text
  function renderText(content: string) {
    if (!highlight || !content) return content;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = content.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-rose/30 text-inherit rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  if (isUnsent) {
    return (
      <div className={`flex ${isMark ? "justify-end" : "justify-start"} mb-2`}>
        <div className="max-w-[75%] rounded-2xl px-4 py-2 bg-steel/20 italic text-steel text-sm">
          Message unsent
          <div className="text-[10px] mt-1 opacity-60">{time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMark ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isMark
            ? "bg-rose text-white rounded-br-md"
            : "bg-blush text-gray-900 rounded-bl-md"
        }`}
      >
        {/* Sender label */}
        <div
          className={`text-[10px] font-semibold mb-1 ${
            isMark ? "text-white/70" : "text-steel"
          }`}
        >
          {senderName.split(" ")[0]}
        </div>

        {/* Media */}
        {media.length > 0 && (
          <div className="mb-2 space-y-2">
            {media.map((m, i) => {
              const src = resolveMediaUri(m.uri);
              const ext = getFileExtension(m.uri);

              if (ext === "mp4") {
                return (
                  <video
                    key={i}
                    src={src}
                    controls
                    className="rounded-lg max-w-full max-h-64"
                    preload="metadata"
                  />
                );
              }
              return (
                <img
                  key={i}
                  src={src}
                  alt="Shared media"
                  className="rounded-lg max-w-full max-h-64 object-cover"
                  loading="lazy"
                />
              );
            })}
          </div>
        )}

        {/* Text content */}
        {text && type === "link" ? (() => {
          const linkUrl = shareLink || extractUrl(text) || text;
          // If text is just the URL, show it as a simple link
          // If text has descriptive content, show the text + a clickable link
          const textIsJustUrl = text.trim() === linkUrl;
          return textIsJustUrl ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline break-all text-sm ${
                isMark ? "text-white/90" : "text-rose"
              }`}
            >
              {linkUrl}
            </a>
          ) : (
            <div className="text-sm">
              <p className="whitespace-pre-wrap break-words mb-1">
                {renderText(text)}
              </p>
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline break-all text-xs ${
                  isMark ? "text-white/70" : "text-rose/80"
                }`}
              >
                {linkUrl}
              </a>
            </div>
          );
        })() : text ? (
          <p className="text-sm whitespace-pre-wrap break-words">
            {renderText(text)}
          </p>
        ) : null}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1 ${
            isMark ? "text-white/50" : "text-steel/60"
          }`}
        >
          {time}
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((r, i) => (
              <ReactionBadge key={i} reaction={r.reaction} actor={r.actor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
