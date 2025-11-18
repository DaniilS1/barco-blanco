// components/ui/AboutSection.tsx
import Image from "next/image";
import Link from "next/link";
function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="about-content">
        {/* About Text */}
        <div className="about-text">
          <h3>ПРО НАС</h3>
          <div className="about-text-inner">
            <p>
              <strong>Barco Blanco</strong> — місце, де поєднуються
              функціональність та естетика, а якість йде поруч із доступністю.
              Ми з гордістю вже 10 років допомагаємо нашим клієнтам створювати
              затишок у їхніх ванних кімнатах, пропонуючи меблі, що відповідають
              сучасним трендам дизайну та майстерності.
            </p>
            <p>
              Наш асортимент включає все необхідне для створення ідеального
              інтер’єру: від стильних меблів  до ергономічних рішень. Кожен виріб у нашому магазині ретельно відібраний, щоб
              відповідати найвищим стандартам якості та довговічності.
            </p>
            <p>
              Наша місія — допомогти вам створити ванну кімнату, яка відображає вашу
              індивідуальність, де кожна деталь продумана і сприяє комфортному
              життю. Ми прагнемо зробити процес вибору та покупки меблів
              максимально простим та приємним, надаючи високий рівень сервісу та
              піклуючись про кожного клієнта.
            </p>
            <p>
              Перегляньте наш каталог і переконайтеся самі: з нами ваша ванна кімната стане
              саме тим затишним куточком, про який ви мріяли!
            </p>
          </div>

          <Link href="/products" className="catalog-button">
            ДО КАТАЛОГУ
          </Link>
        </div>

        {/* About Image */}
        <div className="about-image">
          <div className="relative w-full overflow-hidden rounded-3xl bg-slate-100 sm:aspect-[4/3]">
            <Image
              src="/images/about_section.jpeg"
              alt="Команда Barco Blanco під час роботи над дизайном меблів"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 560px"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
