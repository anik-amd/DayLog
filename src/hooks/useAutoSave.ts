import { useEffect, useRef } from 'react';

export function useAutoSave(
  content: string,
  onSave: (currentContent: string) => Promise<void>,
  delayMs: number = 1000
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set auto-save timer if there is content
    if (content !== undefined && content !== null) {
      timeoutRef.current = setTimeout(async () => {
        await onSave(content);
      }, delayMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delayMs]); // Intentionally omitting onSave to avoid constant re-triggers
}
