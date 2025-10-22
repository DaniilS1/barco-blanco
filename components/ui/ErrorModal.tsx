"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, RefreshCw, Phone } from "lucide-react";
import { Button } from "./button";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  message?: string;
  errorType?: "email" | "network" | "validation" | "server";
}

export default function ErrorModal({
  isOpen,
  onClose,
  onRetry,
  title,
  message,
  errorType = "server",
}: ErrorModalProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case "email":
        return {
          title: title || "Помилка відправки листа",
          message:
            message ||
            "На жаль, не вдалося відправити ваше замовлення через поштовий сервіс. Будь ласка, спробуйте ще раз або зв'яжіться з нами телефоном.",
          icon: <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />,
          showRetry: true,
        };
      case "network":
        return {
          title: title || "Проблема з підключенням",
          message:
            message ||
            "Перевірте ваше інтернет-з'єднання та спробуйте ще раз.",
          icon: <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500" />,
          showRetry: true,
        };
      case "validation":
        return {
          title: title || "Невірні дані",
          message:
            message || "Будь ласка, перевірте введені дані та спробуйте знову.",
          icon: <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />,
          showRetry: false,
        };
      default:
        return {
          title: title || "Помилка сервера",
          message:
            message ||
            "Виникла технічна помилка. Спробуйте ще раз через кілька хвилин.",
          icon: <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />,
          showRetry: true,
        };
    }
  };

  const config = getErrorConfig();

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

              {/* Icon */}
              <div className="flex justify-center mb-4">
                {config.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">
                {config.title}
              </h2>

              {/* Message */}
              <p className="text-sm sm:text-base text-gray-600 text-center mb-6 leading-relaxed">
                {config.message}
              </p>

              {/* Contact Info */}
              <div className="bg-[#4FA7B9]/10 rounded-lg p-4 mb-6">
                <p className="text-xs sm:text-sm text-gray-700 text-center mb-2">
                  Або зв&apos;яжіться з нами напряму:
                </p>
                <a
                  href="tel:+380504730644"
                  className="flex items-center justify-center gap-2 text-sm sm:text-base text-[#1996A3] font-semibold hover:text-[#4FA7B9] transition-colors"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>+38 (050) 47-30-644</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                {config.showRetry && onRetry && (
                  <Button
                    onClick={onRetry}
                    className="flex-1 bg-[#1996A3] hover:bg-[#4FA7B9] text-white py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Спробувати знову
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={`${
                    config.showRetry ? "flex-1" : "w-full"
                  } border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base`}
                >
                  Закрити
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

