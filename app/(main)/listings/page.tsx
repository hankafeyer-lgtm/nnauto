import type { Metadata } from "next";
import { buildSearchMetadata } from "@lib/seo/metadata";
import ListingsClient from "./listings-client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildSearchMetadata(await searchParams);
}

export default function Listings() {
  return <ListingsClient />;
}
