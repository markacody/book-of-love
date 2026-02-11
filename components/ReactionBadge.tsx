"use client";

interface ReactionBadgeProps {
  reaction: string;
  actor: string;
}

export default function ReactionBadge({ reaction, actor }: ReactionBadgeProps) {
  const firstName = actor.split(" ")[0];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-blush/50 px-2 py-0.5 text-xs text-steel"
      title={`${actor} reacted`}
    >
      <span className="text-sm">{reaction}</span>
      <span>{firstName}</span>
    </span>
  );
}
