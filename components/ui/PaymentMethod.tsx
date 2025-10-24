"use client";

import React from "react";

type Props = {
  email?: string;
  selectedLabel?: string;
  showHeading?: boolean;
};

export default function PaymentMethod({
  email = "barcoblanco@ukr.net",
  selectedLabel = "По домовленості",
  showHeading = false,
}: Props) {
  return (
    <div className="w-full m-0 p-0 mb-4 md:mb-6">
      {showHeading ? (
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1996A3] mb-2 pl-0">
          Оплата
        </h3>
      ) : null}

      {/* Сделать внутренний контейнер overflow-visible чтобы иконка/тень не обрезались */}
      <div className="w-full bg-white m-0 p-0 rounded-none shadow-none overflow-visible">
        <div className="w-full bg-white m-0 p-0 rounded-none shadow-none overflow-visible">
          <div className="w-full pt-0 px-3 md:pt-0 md:px-4 pb-2 md:pb-4">
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* чуть подвинул иконку вверх (менее большой промежуток между заголовком и иконкой) */}
              <div className="-mt-2 md:-mt-1 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1b9aa1] to-[#1996A3] flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 10h18" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                  {selectedLabel}
                </div>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Оплата узгоджується з менеджером після підтвердження замовлення. Якщо бажаєте, вкажіть бажаний спосіб оплати у полі «Додаткова інформація» при оформленні.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="tel:+380504730644"
                className="block w-full items-center justify-center px-4 py-2 md:px-6 md:py-3 rounded-lg bg-[#1996A3] text-white text-sm md:text-base font-semibold shadow hover:brightness-95 transition text-center leading-tight whitespace-normal"
                aria-label="Зателефонувати менеджеру"
              >
                Зв'язатися з менеджером
              </a>

              <div className="mt-3 text-xs text-gray-500 text-center">
                Відповідь протягом робочого дня
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}