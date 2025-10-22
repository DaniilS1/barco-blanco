"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Listen for scroll events
    window.addEventListener("scroll", toggleVisibility);

    // Cleanup function
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed z-50 bg-[#1996A3] hover:bg-[#007387] text-white rounded-full shadow-md transition-all duration-300 ease-in-out p-2 scroll-to-top-button ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
      size="icon"
      style={{
        width: "40px",
        height: "40px",
        bottom: "1.5rem",
        right: "1.5rem",
        boxShadow: "0 4px 16px rgba(25, 150, 163, 0.3)",
      }}
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </Button>
  );
}
