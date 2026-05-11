"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useChat } from "@/features/ai/hooks";
import { useApiHealth } from "@/lib/hooks/useApiHealth";
import type { ChatMessage } from "@/features/ai/types";
import type { Product } from "@/features/products/types";
import { formatPrice } from "@/lib/utils";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  suggestedProducts?: Product[];
}

const QUICK_PROMPTS = [
  "Find me a jacket under $60",
  "Best rated electronics",
  "Gifts under $30",
];

const MAX_HISTORY = 20;

const STATUS_COLORS: Record<string, string> = {
  connected: "bg-green-400",
  disconnected: "bg-red-400",
  checking: "bg-yellow-400 animate-pulse",
};

const STATUS_LABELS: Record<string, string> = {
  connected: "Connected",
  disconnected: "API offline",
  checking: "Connecting…",
};

interface ChatWidgetProps {
  onSelectProduct?: (product: Product) => void;
}

export default function ChatWidget({ onSelectProduct }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const status = useApiHealth();
  const { mutateAsync: sendChatAsync, isPending } = useChat();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function handleReset() {
    setMessages([]);
    setHistory([]);
    setInput("");
  }

  async function handleSend() {
    const message = input.trim();
    if (!message || isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");

    try {
      const response = await sendChatAsync({
        message,
        history: history.slice(-MAX_HISTORY),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
          suggestedProducts: response.suggestedProducts,
        },
      ]);

      setHistory((prev) => [
        ...prev.slice(-MAX_HISTORY),
        { role: "user", content: message },
        { role: "assistant", content: response.reply },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      const isOffline = msg.includes("503") || msg.includes("fetch") || msg.includes("abort");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isOffline
            ? "AI service is not available. Make sure Ollama is running."
            : `Error: ${msg}`,
        },
      ]);
    }
  }

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center gap-3 bg-gray-900 px-4 py-3">
            <Sparkles size={16} className="shrink-0 text-white" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Shopping Assistant</p>
              {/* API status indicator */}
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                <p className="text-xs text-gray-400">{STATUS_LABELS[status]}</p>
              </div>
            </div>
            {/* Reset chat */}
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                title="New chat"
              >
                <RotateCcw size={12} />
                New
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Sparkles size={32} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-700">How can I help you?</p>
                <p className="text-xs text-gray-400">
                  Ask about products, prices or get recommendations.
                </p>
                <div className="mt-2 flex w-full flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                        inputRef.current?.focus();
                      }}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="w-full space-y-2">
                    {msg.suggestedProducts.slice(0, 3).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => onSelectProduct?.(product)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 p-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-medium text-gray-900">
                            {product.title}
                          </p>
                          <p className="text-xs font-semibold text-gray-600">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isPending && (
              <div className="flex items-start">
                <div className="flex gap-1 rounded-2xl bg-gray-100 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            {status === "disconnected" && (
              <p className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-center text-xs text-red-600">
                Backend offline — start <code>node mock-server.js</code>
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
                disabled={isPending || status === "disconnected"}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isPending || status === "disconnected"}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
