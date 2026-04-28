"use client";

import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/features/products/types";

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

function StarRating({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < Math.round(rate)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

export default function ProductCard({
  product,
  onViewDetail,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <button
        onClick={() => onViewDetail(product)}
        className="relative flex h-52 items-center justify-center overflow-hidden rounded-t-2xl bg-gray-50 p-6"
        aria-label={`View details for ${product.title}`}
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-500">
          {product.category}
        </span>

        <button
          onClick={() => onViewDetail(product)}
          className="text-left text-sm font-medium leading-snug text-gray-900 line-clamp-2 hover:underline"
        >
          {product.title}
        </button>

        <div className="flex items-center gap-2">
          <StarRating rate={product.rating.rate} />
          <span className="text-xs text-gray-400">
            ({product.rating.count})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => onAddToCart?.(product)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 active:scale-95"
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
