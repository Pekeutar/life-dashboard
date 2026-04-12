"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal typing of the Web Speech API we need.
 * The DOM lib doesn't ship SpeechRecognition types in all TS versions.
 */
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
}

export interface UseSpeechRecognitionReturn {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Wraps the browser Web Speech API. Zero-cost dictation — runs entirely
 * in the browser (on-device on Safari iOS/macOS, Google servers on Chrome).
 * Falls back gracefully to `supported=false` so the UI can hide the mic.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = "fr-FR", continuous = true } = options;
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTranscriptRef = useRef("");

  useEffect(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const instance = new Ctor();
    instance.lang = lang;
    instance.continuous = continuous;
    instance.interimResults = true;

    instance.onresult = (event) => {
      let interim = "";
      let finalText = baseTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const piece = result[0].transcript;
        if (result.isFinal) {
          finalText += (finalText && !finalText.endsWith(" ") ? " " : "") + piece;
        } else {
          interim += piece;
        }
      }
      baseTranscriptRef.current = finalText;
      const composed = (finalText + (interim ? " " + interim : "")).trim();
      setTranscript(composed);
    };

    instance.onerror = (event) => {
      setError(event.error || "Erreur micro");
      setListening(false);
    };

    instance.onend = () => {
      setListening(false);
    };

    instance.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognitionRef.current = instance;

    return () => {
      instance.onresult = null;
      instance.onerror = null;
      instance.onend = null;
      instance.onstart = null;
      try {
        instance.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [lang, continuous]);

  const start = useCallback(() => {
    const instance = recognitionRef.current;
    if (!instance) return;
    try {
      instance.start();
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const stop = useCallback(() => {
    const instance = recognitionRef.current;
    if (!instance) return;
    try {
      instance.stop();
    } catch {
      // ignore — already stopped
    }
  }, []);

  const reset = useCallback(() => {
    baseTranscriptRef.current = "";
    setTranscript("");
    setError(null);
  }, []);

  return { supported, listening, transcript, error, start, stop, reset };
}
