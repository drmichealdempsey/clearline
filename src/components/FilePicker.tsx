"use client";

import { useRef, useState } from "react";
import { ACCEPTED_FILE_TYPES, MAX_FILE_BYTES, formatBytes, validateFiles } from "@/lib/files";
import { cn } from "@/lib/utils";
import { FileIcon, UploadIcon, XIcon } from "@/components/icons";

export function FilePicker({
  files,
  onChange,
  multiple = true,
  disabled = false,
  hint,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function add(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    const problem = validateFiles(next);
    if (problem) {
      setError(problem);
    } else {
      setError(null);
      onChange(next);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition",
          dragging
            ? "border-brass-400/70 bg-brass-400/[0.06]"
            : "border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={ACCEPTED_FILE_TYPES}
          disabled={disabled}
          onChange={(e) => add(e.target.files)}
        />
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] text-brass-300">
          <UploadIcon />
        </span>
        <span className="text-sm text-zinc-200">
          Drop {multiple ? "files" : "a file"} here or <span className="text-brass-300 underline-offset-4 hover:underline">browse</span>
        </span>
        <span className="text-xs text-zinc-500">
          {hint ?? `Screenshots, PDFs, documents, photos · up to ${formatBytes(MAX_FILE_BYTES)} each`}
        </span>
      </label>

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.size}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <FileIcon width={16} height={16} className="shrink-0 text-zinc-500" />
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{file.name}</span>
              <span className="shrink-0 text-xs text-zinc-500">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={disabled}
                className="shrink-0 rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                aria-label={`Remove ${file.name}`}
              >
                <XIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
