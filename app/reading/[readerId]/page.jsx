import { notFound } from "next/navigation";
import SolReadingExperience from "@/components/SolReadingExperience";
import { getReaderScene } from "@/data/readerScenes";

export default async function ReaderReadingPage({ params }) {
  const { readerId } = await params;

  if (!getReaderScene(readerId)) {
    notFound();
  }

  return <SolReadingExperience readerId={readerId} />;
}
