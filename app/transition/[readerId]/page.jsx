import { notFound } from "next/navigation";
import SolTransition from "@/components/SolTransition";
import { getReaderScene } from "@/data/readerScenes";

export default async function ReaderTransitionPage({ params }) {
  const { readerId } = await params;

  if (!getReaderScene(readerId)) {
    notFound();
  }

  return <SolTransition readerId={readerId} />;
}
