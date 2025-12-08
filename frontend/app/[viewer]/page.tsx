import Viewer from "@/components/Viewer";

export default async function Home({
  params,
}: {
  params: Promise<{ viewer: string }>;
}) {
  const { viewer } = await params;

  return (
    <main>
      <Viewer params={{ viewer }} />
    </main>
  );
}
