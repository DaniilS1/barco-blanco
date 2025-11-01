"use client";

import "../globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CartModalWrapper from "@/components/ui/CartModalWrapper";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/favorites-context";
import { useScrollToTop } from "@/hook/useScrollToTop";  // импортируем хук

export default function StoreLayout({ children }: { children: ReactNode }) {
  useScrollToTop(); // вызываем хук здесь

  return (
    <FavoritesProvider>
      <CartProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
          <CartModalWrapper />
        </div>
      </CartProvider>
    </FavoritesProvider>
  );
}



