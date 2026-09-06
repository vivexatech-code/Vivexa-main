"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  placeholder?: string;
  suggestions?: string[];
};

export function TagInput({
  value,
  onChange,
  max = 3,
  placeholder = "Add a tag and press Enter",
  suggestions = ["Web Development", "UI/UX", "Digital Solutions"],
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, "");
    if (!tag) return;
    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }
    if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-input bg-card px-2.5 py-2",
          value.length >= max && "opacity-90",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="rounded-sm p-0.5 hover:bg-primary/10"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length < max ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => addTag(draft)}
            placeholder={value.length ? "" : placeholder}
            className="h-8 min-w-[140px] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          />
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length}/{max} tags. Press Enter or comma to add.
      </p>
      {value.length < max ? (
        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter(
              (item) =>
                !value.some((tag) => tag.toLowerCase() === item.toLowerCase()),
            )
            .map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => addTag(item)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {item}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
