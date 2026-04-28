"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Star, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/features/products/types";
import Recommendations from "./Recommendations";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onSelect?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onSelect,
}: ProductDetailModalProps) {
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  // Close on Escape key
  useEffect(() => {
    if (!product) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  // Scroll details panel to top when navigating between recommendations
  useEffect(() => {
    detailsPanelRef.current?.scrollTo({ top: 0 });
  }, [product?.id]);

  if (!product) return null;

  const filledStars = Math.round(product.rating.rate);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label={product.title}
    >
      {/* Panel — stop click propagation so clicking inside doesn't close */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl sm:flex-row sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={16} />
        </button>

        {/* Image panel */}
        <div className="relative flex h-64 shrink-0 items-center justify-center bg-gray-50 sm:h-auto sm:w-80">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-contain p-8"
          />
        </div>

        {/* Details panel */}
        <div ref={detailsPanelRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-500">
            {product.category}
          </span>

          <h2 className="text-lg font-semibold leading-snug text-gray-900">
            {product.title}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={
                    i < filledStars
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating.rate.toFixed(1)} · {product.rating.count} reviews
            </span>
          </div>

          <p className="flex-1 text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={() => onAddToCart?.(product)}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 active:scale-95"
            >
              <ShoppingCart size={16} />
              Add to cart
            </button>
          </div>

          {onSelect && (
            <Recommendations current={product} onSelect={onSelect} />
          )}
        </div>
      </div>
    </div>
  );
}
