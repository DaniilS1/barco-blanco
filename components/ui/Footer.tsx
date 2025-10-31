"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";

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

  function openTelegram(e: React.MouseEvent) {
    e.preventDefault();
    const app = `tg://resolve?phone=%2B${phoneDigits}`; // native
    const web = `https://t.me/+${phoneDigits}`;         // web fallback (may work in many cases)
    openDeepLink(app, web, `tel:${phoneRaw}`);
  }

  function openViber(e: React.MouseEvent) {
    e.preventDefault();
    // native deep link to open chat in Viber app
    const app = `viber://chat?number=%2B${phoneDigits}`; 
    // don't use viber.me as reliable fallback for starting chat by phone (often shows "account not exist")
    // вместо этого открываем web.viber.com (потребует логин) или делаем fallback на звонок
    const web = `https://web.viber.com/`;
    openDeepLink(app, web, `tel:${phoneRaw}`);
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
    </footer>
  );
};

export default Footer;
