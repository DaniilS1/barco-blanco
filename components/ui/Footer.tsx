"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

const Footer = () => {
  const phoneRaw = "+380504730644";
  const phoneDigits = phoneRaw.replace(/\D/g, ""); // 380504730644

  function handleAboutClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window === "undefined") return;

    if (window.location.pathname === "/") {
      const el = document.getElementById("about");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    window.location.href = `${window.location.origin}/#about`;
  }

  // Try open native app link, fallback to web/tel link after timeout
  function openDeepLink(appUrl: string, webUrl: string, fallbackUrl?: string) {
    try {
      // try open native app
      window.location.href = appUrl;
      // fallback after short delay
      setTimeout(() => {
        // prefer webUrl if provided, otherwise fallbackUrl (tel:) to avoid "account not found" page
        if (webUrl) {
          window.open(webUrl, "_blank");
        } else if (fallbackUrl) {
          window.open(fallbackUrl, "_blank");
        }
      }, 700);
    } catch {
      if (webUrl) window.open(webUrl, "_blank");
      else if (fallbackUrl) window.open(fallbackUrl, "_blank");
    }
  }

  // --------- Viber: try open app only; if not opened -> show local fallback panel (no web redirect) ----------
  const [viberFallbackVisible, setViberFallbackVisible] = useState(false);
  // безопасная типизация для таймера в браузере и в средах Node
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function attemptOpenAppOnly(openUrl: string) {
    console.log("[Viber] attemptOpenAppOnly, url:", openUrl);
    try {
      // try to open native app (intent / scheme)
      window.location.href = openUrl;
    } catch {
      // ignore
    }

    // show local fallback panel if app didn't open (user stays on page)
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      setViberFallbackVisible(true);
    }, 800);
  }

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  function copyPhone() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phoneRaw);
    }
    setViberFallbackVisible(false);
    alert("Номер скопійовано");
  }

  function callPhone() {
    window.location.href = `tel:${phoneRaw}`;
  }
  // ---------------------------------------------------------------------------------------

  function openTelegram(e: React.MouseEvent) {
    e.preventDefault();
    const app = `tg://resolve?phone=%2B${phoneDigits}`; // native
    const web = `https://t.me/+${phoneDigits}`;         // web fallback (may work in many cases)
    openDeepLink(app, web, `tel:${phoneRaw}`);
  }

  // openViber: try only native app (intent / scheme). Do NOT redirect to web.viber.com.
  function openViber(e: React.MouseEvent) {
    e.preventDefault();
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    console.log("[Viber] openViber called, isAndroid:", isAndroid, "isIOS:", isIOS);

    if (isAndroid) {
      const intentUrl = `intent://chat?number=%2B${phoneDigits}#Intent;package=com.viber.voip;scheme=viber;end`;
      attemptOpenAppOnly(intentUrl);
      return;
    }

    if (isIOS) {
      const appUrl = `viber://chat?number=%2B${phoneDigits}`;
      attemptOpenAppOnly(appUrl);
      return;
    }

    // Desktop/unknown: показываем локальную панель с действиями (без перехода на web.viber)
    setViberFallbackVisible(true);
  }

  return (
    <footer className="bg-[#008c99] py-6 text-center text-white">
      <div className="max-w-[1000px] w-full mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-6 text-white text-center md:text-left">

          {/* Контакти */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-1">Контакти</h3>
            <a href={`tel:${phoneRaw}`} className="hover:underline">
              {phoneRaw}
            </a>
            <a href="mailto:avsdom@ukr.net" className="hover:underline">
              avsdom@ukr.net
            </a>
          </div>

          {/* Інформація + (DESKTOP Icons) */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-1">Інформація</h3>
            <Link href="/#about" onClick={handleAboutClick} className="hover:underline mb-1">
              Про нас
            </Link>
            <Link href="/guarantee" className="hover:underline mb-1">
              Гарантія
            </Link>
            <Link href="/delivery" className="hover:underline mb-1">
              Доставка та оплата
            </Link>

            {/* Icons: show on desktop (md) and bigger only */}
            <div className="hidden md:flex justify-center gap-6 mt-2">
              {/* href -> web fallback, onClick -> try native then fallback */}
              <a
                href={`tg://resolve?phone=%2B${phoneDigits}`} // deep link for mobile
                onClick={openTelegram}
                aria-label="Telegram"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/telegram_icon.svg"
                  alt="Telegram"
                  width={35}
                  height={30}
                  className="hover:scale-110 transition-transform"
                />
              </a>
              <a
                href={`viber://chat?number=%2B${phoneDigits}`} // deep link for mobile
                onClick={openViber}
                aria-label="Viber"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/viber-footer.svg"
                  alt="Viber"
                  width={34}
                  height={30}
                  className="hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://www.instagram.com/barco_blanco__?igsh=c2d4MXpuOW5rNG9t"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"              >
                <Image
                  src="/icons/instagram_icon.svg"
                  alt="Instagram"
                  width={30}
                  height={30}
                  className="hover:scale-110 transition-transform"
                />
              </a>
            </div>
          </div>

          {/* Ми працюємо + (MOBILE Icons) */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-1">Ми працюємо</h3>
            <p className="text-sm">Пн-Сб: з 9.00 до 18.00</p>
            <p className="text-sm">Вихідний: Неділя</p>

            {/* Icons: show on mobile (below md) only */}
            <div className="flex md:hidden justify-center gap-6 mt-2">
              <a
                href={`tg://resolve?phone=%2B${phoneDigits}`}
                onClick={openTelegram}
                aria-label="Telegram"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/telegram_icon.svg"
                  alt="Telegram"
                  width={35}
                  height={30}
                  className="hover:scale-110 transition-transform"
                />
              </a>
              <a
                href={`viber://chat?number=%2B${phoneDigits}`}
                onClick={openViber}
                aria-label="Viber"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/viber-footer.svg"
                  alt="Viber"
                  width={34}
                  height={30}
                  className="hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://www.instagram.com/barco_blanco__?igsh=c2d4MXpuOW5rNG9t"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Image
                  src="/icons/instagram_icon.svg"
                  alt="Instagram"
                  width={30}
                  height={30}
                  className="hover:scale-110 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Viber fallback panel (через portal в document.body чтобы избежать "улёта" из‑за предков) */}
      {typeof document !== "undefined" &&
        createPortal(
          viberFallbackVisible ? (
            <div
              id="viber-panel"
              className="bg-white text-black rounded-lg shadow-lg p-3 w-[260px] relative"
              // inline style — жёстко ставим позиционирование и высокий z-index для отладки
              style={{
                position: "fixed",
                right: "1rem",
                left: "auto",
                bottom: "1rem",
                maxWidth: "260px",
                zIndex: 2147483647,
              }}
            >
               <button
                 onClick={() => setViberFallbackVisible(false)}
                 aria-label="Закрити"
                 title="Закрити"
                 className="absolute -top-3 -right-3 bg-white border rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-gray-100"
               >
                 ×
               </button>
               <div className="font-semibold mb-2">Відкрити Viber не вдалося</div>
               <div className="text-sm mb-3">Ви можете:</div>
               <div className="flex gap-2">
                 <button onClick={callPhone} className="flex-1 bg-[#008c99] text-white py-2 rounded">Подзвонити</button>
                 <button onClick={copyPhone} className="flex-1 border py-2 rounded">Скопіювати</button>
               </div>
               <div className="text-xs mt-2 text-gray-600 whitespace-nowrap">Або відкрийте Viber вручну на телефоні.</div>
             </div>
           ) : null,
           document.body
         )}
    </footer>
  );
};

export default Footer;
