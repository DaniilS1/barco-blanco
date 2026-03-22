// app/api/search/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  if (!query) {
    return NextResponse.json([]);
  }
  const num = Number(query);
  const isNumeric = !isNaN(num);
  const groqQuery = isNumeric
    ? `*[_type == "product" && (width >= ${num} && width <= ${num})][0...10]{ name, "slug": slug.current, width }`
    : `*[_type == "product" && name match "${query}*"][0...10]{ name, "slug": slug.current }`;
  try {
    const results = await client.fetch(groqQuery);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
