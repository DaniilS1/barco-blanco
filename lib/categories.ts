// lib/categories.ts
// Zentrale Metadaten für die Produktkategorien (SEO: Title/Description/H1/Intro).

export interface CategoryInfo {
  /** Slug wie in der URL /category/<slug> und im Sanity-Feld `category` */
  slug: string;
  /** Kurzname für Breadcrumbs / Navigation */
  label: string;
  /** Sichtbare Seitenüberschrift */
  h1: string;
  /** <title> ohne Markenzusatz – das Template in app/layout.tsx hängt " | Barco Blanco" an */
  title: string;
  /** Meta-Description */
  description: string;
  /** Server-seitig gerenderter Einleitungstext oberhalb der Produktliste */
  intro: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  dzerkala: {
    slug: "dzerkala",
    label: "Дзеркала",
    h1: "Дзеркала для ванної кімнати",
    title: "Дзеркала для ванної кімнати з підсвіткою",
    description:
      "Дзеркала для ванної кімнати від Barco Blanco: моделі з LED-підсвіткою, антизапотіванням та поличками. Власне виробництво, доставка по всій Україні.",
    intro:
      "Дзеркала для ванної кімнати Barco Blanco — з LED-підсвіткою, функцією антизапотівання та зручними полицями. Усі моделі виготовляються на власному виробництві з вологостійких матеріалів.",
  },
  tumby: {
    slug: "tumby",
    label: "Тумби",
    h1: "Тумби для ванної кімнати з умивальником",
    title: "Тумби для ванної кімнати з умивальником",
    description:
      "Тумби під умивальник для ванної кімнати: підвісні та підлогові моделі шириною від 40 до 100 см. Вологостійкі матеріали, фурнітура з дотягом, доставка по Україні.",
    intro:
      "Тумби для ванної кімнати Barco Blanco з умивальником — підвісні та підлогові, шириною від 40 до 100 см. Фасади з вологостійкого МДФ і завіси з дотягом для плавного закриття.",
  },
  penaly: {
    slug: "penaly",
    label: "Пенали",
    h1: "Пенали для ванної кімнати",
    title: "Пенали для ванної кімнати — вузькі шафи",
    description:
      "Пенали для ванної кімнати шириною 30–40 см: місткі вузькі шафи для рушників, побутової хімії та косметики. Вологостійке виконання, доставка по Україні.",
    intro:
      "Пенали для ванної кімнати Barco Blanco — вузькі та місткі шафи шириною 30–40 см для зберігання рушників, побутової хімії й косметики.",
  },
  shafy: {
    slug: "shafy",
    label: "Навісні шафи",
    h1: "Навісні шафи для ванної кімнати",
    title: "Навісні шафи для ванної кімнати",
    description:
      "Навісні шафи для ванної кімнати шириною 40–60 см: закриті моделі та з дзеркальними фасадами. Вологостійкі матеріали, доставка по всій Україні.",
    intro:
      "Навісні шафи Barco Blanco для ванної кімнати — компактні моделі шириною 40–60 см із закритими або дзеркальними фасадами.",
  },
  vologostiike: {
    slug: "vologostiike",
    label: "Колекція Water",
    h1: "Водостійкі меблі — колекція Water",
    title: "Водостійкі меблі для ванної — колекція Water",
    description:
      "Колекція Water від Barco Blanco: повністю водостійкі тумби для ванної кімнати, що витримують пряме потрапляння води. Власне виробництво, доставка по Україні.",
    intro:
      "Колекція Water — повністю водостійкі меблі Barco Blanco. Корпус і фасади зі спеціального МДФ, ламіновані водонепроникним матеріалом, з фурнітурою та кріпленням із нержавіючої сталі.",
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORIES);

export function getCategoryInfo(slug: string): CategoryInfo | undefined {
  return CATEGORIES[slug];
}
