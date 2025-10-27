import Viewer from "@/components/Viewer";

export default function Home({ params }: { params: { viewer: string } }) {
  const { viewer } = params;
  return (
    <main>
      <Viewer params={{ viewer }} />
    </main>
  );
}
