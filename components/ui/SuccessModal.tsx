"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Home, ShoppingBag } from "lucide-react";
import { Button } from "./button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  onContinueShopping?: () => void;
  title?: string;
  message?: string;
  orderNumber?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  onGoHome,
  onContinueShopping,
  title = "Замовлення успішно оформлене!",
  message = "Вам надіслано підтвердження на пошту.",
  orderNumber,
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-[95vw] sm:max-w-md w-full p-4 sm:p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3"
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm sm:text-base text-gray-600 text-center mb-4 leading-relaxed"
              >
                {message}
              </motion.p>

              {/* Order Number */}
              {orderNumber && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[#4FA7B9]/10 rounded-lg p-3 mb-6 text-center"
                >
                  <p className="text-sm text-gray-600 mb-1">Номер замовлення:</p>
                  <p className="font-semibold text-[#1996A3] text-base sm:text-lg">{orderNumber}</p>
                </motion.div>
              )}

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-50 rounded-lg p-4 mb-6"
              >
                <p className="text-xs sm:text-sm text-gray-700 text-center">
                  Наш менеджер зв&apos;яжеться з вами найближчим часом для підтвердження замовлення.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-2 sm:gap-3"
              >
                {onGoHome && (
                  <Button
                    onClick={onGoHome}
                    className="flex-1 bg-[#1996A3] hover:bg-[#4FA7B9] text-white py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                  >
                    <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    На головну
                  </Button>
                )}
                {onContinueShopping && (
                  <Button
                    onClick={onContinueShopping}
                    variant="outline"
                    className="flex-1 border-2 border-[#1996A3] text-[#1996A3] hover:bg-[#1996A3] hover:text-white py-2.5 sm:py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    Продовжити покупки
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
