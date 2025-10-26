"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";

const Footer = () => {
  function handleAboutClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window === "undefined") return;

    // Если мы уже на главной странице — плавно скроллим к секции с id="about"
    if (window.location.pathname === "/") {
      const el = document.getElementById("about");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    // Иначе переходим на главную с хэшем — браузер/сервер загрузит нужную секцию
    window.location.href = `${window.location.origin}/#about`;
  }

  return (
    <footer className="bg-[#008c99] py-8 text-center text-white">
      <div className="max-w-[1000px] w-full mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 text-white text-center md:text-center">

          {/* Контакти */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Контакти</h3>
            <a href="tel:+380504730644" className="hover:underline">
              +38 (050) 47-30-644
            </a>
            <a href="mailto:avsdom@ukr.net" className="hover:underline">
              avsdom@ukr.net
            </a>
          </div>

          {/* Інформація + (DESKTOP Icons) */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold mb-2">Інформація</h3>
            {/* Используем onClick чтобы гарантировать поведение скролла из любой страницы */}
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
            <div className="hidden md:flex justify-center gap-8 mt-4">
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
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
                href="https://viber.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Viber"
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
                href="https://instagram.com"
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
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Ми працюємо</h3>
            <p>Пн-Сб: з 9.00 до 18.00</p>
            <p>Вихідний: Неділя</p>

            {/* Icons: show on mobile (below md) only */}
            <div className="flex md:hidden justify-center gap-8 mt-4">
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
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
                href="https://viber.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Viber"
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
                href="https://instagram.com"
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
