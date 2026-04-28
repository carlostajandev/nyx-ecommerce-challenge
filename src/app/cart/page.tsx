"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/features/cart/store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Computed with useMemo — avoids deriving an object directly from the selector
  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    [items],
  );

  function handleCheckout() {
    clearCart();
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          ¡Compra realizada!
        </h1>
        <p className="mt-2 text-gray-500">
          Gracias por tu pedido. Te enviaremos un correo de confirmación.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Seguir comprando
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-xl font-semibold text-gray-700">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-gray-400">Agrega productos desde el catálogo.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tu carrito</h1>

      {/* Item list */}
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>

            {/* Name + unit price */}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-gray-900">
                {product.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatPrice(product.price)} c/u
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Line subtotal */}
            <span className="w-20 text-right text-sm font-semibold text-gray-900">
              {formatPrice(product.price * quantity)}
            </span>

            {/* Remove */}
            <button
              onClick={() => removeItem(product.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove ${product.title} from cart`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col items-end gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-base font-medium text-gray-500">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(total)}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            ← Seguir comprando
          </Link>
          <button
            onClick={handleCheckout}
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 active:scale-95"
          >
            Pagar
          </button>
        </div>
      </div>
    </main>
  );
}
