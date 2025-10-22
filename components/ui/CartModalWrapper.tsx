"use client";

import { useCart } from "@/context/CartContext";
import CartSuccessModal from "./CartSuccessModal";

export default function CartModalWrapper() {
  const { 
    showSuccessModal, 
    setShowSuccessModal, 
    lastAddedProduct 
  } = useCart();

  return (
    <CartSuccessModal
      open={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      productName={lastAddedProduct?.name}
    />
  );
}
