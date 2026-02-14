// sanity/lib/queries/productQueries.ts

export const productQuery = `
  *[_type == "product" && !(_id in path("drafts.**"))] {
    _id,
    name,
    slug,
    price,
    details,
    image[] {
      asset-> {
        url
      },
      alt
    },
    category,
    width,
    isPopular,
    height,
    depth,
    isAvailable,
  }
`;

/** Projection for product feed (slug as string, full image refs for urlFor). */
export const productFeedQuery = `
  *[_type == "product" && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    price,
    details,
    category,
    width,
    height,
    depth,
    isPopular,
    image,
    isAvailable,
  }
`;