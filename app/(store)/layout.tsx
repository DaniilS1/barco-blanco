"use client";

import "../globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CartModalWrapper from "@/components/ui/CartModalWrapper";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { useScrollToTop } from "@/hook/useScrollToTop";  // импортируем хук

export default function StoreLayout({ children }: { children: ReactNode }) {
  useScrollToTop(); // вызываем хук здесь

  return (
    <CartProvider>
      <div className="app-container">
        <Navbar />
        <main className="main-content">{children}</main>
        <Footer />
        <CartModalWrapper />
      </div>
    </CartProvider>
  );
}



