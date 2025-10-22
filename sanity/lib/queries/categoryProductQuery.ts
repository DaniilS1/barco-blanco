// sanity/lib/queries/categoryProductQuery.ts
export const categoryProductQuery = (category: string) => `
  *[_type == "product" && category == "${category}"]{
    _id,
    name,
    slug,
    price,
    details,
    image[] {
      asset-> {
        url
      }
    },
    category,
    width, depth, height,
    isPopular,
    isAvailable,
  }
`;
