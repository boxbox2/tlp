import TarotPortal from "@/components/TarotPortal";

export default async function ReadingPage({ searchParams }) {
  const params = (await searchParams) || {};
  const initialReaderId =
    typeof params.reader === "string" ? params.reader : undefined;

  return <TarotPortal initialReaderId={initialReaderId} />;
}
