"use client";

import { useEffect, useRef, useCallback } from "react";

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minLength?: number;
  timeoutMs?: number;
}

/**
 * Hook for USB/Bluetooth barcode scanner support.
 * Scanners emulate keyboard input - they type rapidly and end with Enter.
 * This hook captures that pattern and fires onScan with the barcode value.
 */
export function useBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 4,
  timeoutMs = 80,
}: BarcodeScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processBuffer = useCallback(() => {
    const barcode = bufferRef.current.trim();
    if (barcode.length >= minLength) {
      onScan(barcode);
    }
    bufferRef.current = "";
  }, [onScan, minLength]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input/textarea (unless it's the barcode scanner input)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      // Allow scanner to work even when input is focused (scanner types fast)
      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      const isScanner = timeSinceLast < timeoutMs;

      if (isInput && !isScanner) return;

      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        processBuffer();
        return;
      }

      // Only collect printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          // If enough time passed without Enter, it's probably manual typing
          bufferRef.current = "";
        }, timeoutMs * 5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, processBuffer, timeoutMs]);
}
