"use client";

import Link from "next/link";
import Image from "next/image";

const BRAND = "#008c99";

type Cat = { title: string; href: string; image: string };

const categories: Cat[] = [
  { title: "Дзеркала", href: "/category/dzerkala", image: "/images/mirror.jpg" },
  { title: "Тумби", href: "/category/tumby", image: "/images/cabinet.jpeg" },
  { title: "Пенали", href: "/category/penaly", image: "/images/dresser.jpg" },
  { title: "Нависні Шафи", href: "/category/shafy", image: "/images/wardrobe.jpeg" },
  { title: "Water", href: "/category/vologostiike", image: "/images/waterproof.jpeg" },
];

export default function Categories() {
  // Хелпер: бьём массив на строки фиксированного размера
  const chunk = <T,>(arr: T[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );

  // xs (<640px): 2 колонки; sm (≥640px): 3 колонки
  const xsRows = chunk(categories, 2);
  const smRows = chunk(categories, 3);

  // ширины колонок с учётом gap-x-4 (16px)
  const xsColWidth = "calc((100% - 16px) / 2)";
  const smColWidth = "calc((100% - 32px) / 3)";

  return (
    <section className="bg-white py-10 px-4">
      <div className="max-w-[1500px] mx-auto">
        {/* ===== XS: 2 колонки. Последняя неполная строка центрируется ===== */}
        <div className="block sm:hidden space-y-6">
          {xsRows.map((row, i) => {
            const isLast = i === xsRows.length - 1;

            if (!isLast || row.length === 2) {
              return (
                <div key={`xs-row-${i}`} className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {row.map((c) => (
                    <CategoryCard key={`xs-${c.href}`} {...c} />
                  ))}
                </div>
              );
            }

            // В последней строке осталась 1 карточка — центрируем
            return (
              <div key={`xs-row-${i}`} className="flex justify-center gap-x-4 mt-6">
                <div style={{ width: xsColWidth }}>
                  <CategoryCard {...row[0]} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== SM: 3 колонки. Любая неполная последняя строка центрируется ===== */}
        <div className="hidden sm:block lg:hidden space-y-6">
          {smRows.map((row, i) => {
            const isLast = i === smRows.length - 1;

            if (!isLast || row.length === 3) {
              return (
                <div key={`sm-row-${i}`} className="grid grid-cols-3 gap-x-4 gap-y-6">
                  {row.map((c) => (
                    <CategoryCard key={`sm-${c.href}`} {...c} />
                  ))}
                </div>
              );
            }

            // Последняя строка содержит 1–2 карточки — центрируем
            return (
              <div key={`sm-row-${i}`} className="flex justify-center gap-x-4 mt-6">
                {row.map((c) => (
                  <div key={`sm-last-${c.href}`} style={{ width: smColWidth }}>
                    <CategoryCard {...c} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* ===== LG+: обычная сетка на 5 колонок ===== */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-x-4 gap-y-6">
          {categories.map((c) => (
            <CategoryCard key={`lg-${c.href}`} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ title, href, image }: Cat) {
  return (
    <Link href={href} className="block">
      <article className="relative rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] bg-white ring-1 ring-black/5">
        {/* размеры — как у тебя были */}
        <div className="relative w-full aspect-square sm:aspect-auto sm:h-[220px] md:h-[260px] lg:h-[320px] rounded-t-3xl overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            priority={false}
          />
        </div>
        <div
          className="w-full text-center py-3 font-bold text-white text-base sm:text-lg rounded-b-3xl tracking-wide"
          style={{ background: BRAND }}
        >
          {title}
        </div>
      </article>
    </Link>
  );
}