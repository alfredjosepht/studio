import AnimalMojiClient from './animalmoji-client';

export default function Home() {
  return (
    <main className="bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <AnimalMojiClient />
      </div>
    </main>
  );
}
