import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PawPrint } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
       <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center mb-4">
            <PawPrint className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">AnimalMoji</h1>
        <p className="mt-2 text-lg text-muted-foreground">What's your animal really thinking? Upload a pic to find out!</p>
      </div>
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="mt-8 h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
