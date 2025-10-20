// sanity/lib/client.ts
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url"; // Ensure this import is present
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  perspective: 'published', // Only fetch published content
  stega: false, // Disable visual editing features for better performance
  timeout: 10000, // 10 second timeout
});

const builder = imageUrlBuilder(client); // Use 'client' here instead of 'sanityClient'

export const urlFor = (source: any) => builder.image(source);
