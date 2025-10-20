// sanity/schemaTypes/product.ts

import { Rule } from "sanity";

const producjschema = {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    {
      name: "image",
      title: "Зображення",
      type: "array",
      of: [
        {
          type: "image",
          fields: [
            {
              name: "alt",
              title: "Альтернативний текст",
              type: "string",
            },
          ],
          options: { hotspot: true },
        },
      ],
      validation: (Rule: Rule) =>
        Rule.required()
          .min(1)
          .error("Потрібно додати принаймні одне зображення."),
    },
    {
      name: "name",
      title: "Назва",
      type: "string",
      validation: (Rule: Rule) =>
        Rule.required().error("Назва товару є обов'язковою."),
    },
    {
      name: "slug",
      title: "Слаг (URL-адреса)",
      type: "slug",
      options: { source: "name", maxLength: 90 },
      validation: (Rule: Rule) =>
        Rule.required().error("Слаг (частина URL) є обов'язковим."),
    },
    {
      name: "price",
      title: "Ціна",
      type: "number",
      validation: (Rule: Rule) =>
        Rule.required()
          .positive()
          .error("Ціна має бути обов'язковим, додатним числом."),
    },
    {
      name: "details",
      title: "Опис/Деталі",
      type: "text",
      validation: (Rule: Rule) =>
        Rule.required().error("Детальний опис є обов'язковим."),
    },
    {
      name: "category",
      title: "Категорія",
      type: "string",
      initialValue: () => "dzerkala",
      options: {
        list: [
          { title: "Дзеркала", value: "dzerkala" },
          { title: "Шафи", value: "shafy" },
          { title: "Тумби", value: "tumby" },
          { title: "Вологостійке", value: "vologostiike" },
          { title: "Пенали", value: "penaly" },
        ],

        layout: "radio",
      },
      validation: (Rule: Rule) =>
        Rule.required().error("Потрібно обрати категорію."),
    },
    {
      name: "width",
      title: "Ширина (см)",
      type: "number",
      validation: (Rule: Rule) =>
        Rule.required().positive().error("Ширина є обов'язковою."),
    },
    {
      name: "height",
      title: "Висота (см)",
      type: "number",
      validation: (Rule: Rule) =>
        Rule.required().positive().error("Висота є обов'язковою."),
    },
    {
      name: "depth",
      title: "Глибина (см)",
      type: "number",
      validation: (Rule: Rule) =>
        Rule.required().positive().error("Глибина є обов'язковою."),
    },
    {
      name: "isPopular",
      title: "Популярний",
      type: "boolean",
      description:
        "Позначте цей товар як популярний, щоб відобразити його у відповідному розділі.",
      initialValue: false,
    },
    {
      name: "isAvailable",
      title: "В наявності",
      type: "boolean",
      description: "Позначте, щоб відобразити, що товар є на складі.",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: "name",
      media: "image.0",
      subtitle: "category",
    },
  },
};

export default producjschema;