import AnimalMojiClient from './animalmoji-client';

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const emoji = typeof searchParams?.emoji === 'string' ? searchParams.emoji : null;

  return (
    <main className="bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <AnimalMojiClient initialEmoji={emoji} />
      </div>
    </main>
  );
}
