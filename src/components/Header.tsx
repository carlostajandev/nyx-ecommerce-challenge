"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="text-xl font-black tracking-tight text-gray-900">NYX</span>
          <span className="text-xl font-light tracking-tight text-gray-400">Store</span>
        </Link>

        <Link
          href="/cart"
          aria-label={`Shopping cart, ${cartCount} items`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ShoppingCart size={22} className="text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
