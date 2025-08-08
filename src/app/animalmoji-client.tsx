"use client";

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2, X, PawPrint, WandSparkles } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getExpressionForAnimal } from './actions';
import { cn } from '@/lib/utils';

export default function AnimalMojiClient() {
  const [image, setImage] = useState<string | null>(null);
  const [expression, setExpression] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setError(null);
      setExpression(null);

      startTransition(async () => {
        const result = await getExpressionForAnimal(dataUrl);
        if (result.success) {
          setExpression(result.expression);
        } else {
          setError(result.error);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isOver);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleReset = () => {
    setImage(null);
    setExpression(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center mb-4">
            <PawPrint className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Animal Expression</h1>
        <p className="mt-2 text-lg text-muted-foreground">What's your animal really feeling? Upload a pic to find out!</p>
      </div>

      <Card className="overflow-hidden transition-all duration-500">
        <CardContent className="p-4 sm:p-8">
          {!image ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => handleDragEvents(e, true)}
              onDragLeave={(e) => handleDragEvents(e, false)}
              onDrop={handleDrop}
            >
              <UploadCloud className="w-16 h-16 text-primary/70 mb-4" />
              <p className="font-semibold text-lg">Click to upload or drag & drop</p>
              <p className="text-muted-foreground text-sm mt-1">PNG, JPG, or WEBP</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-md rounded-lg overflow-hidden shadow-lg mb-6">
                <Image src={image} alt="User's animal" layout="fill" objectFit="cover" data-ai-hint="animal" />
                {isPending && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg font-semibold">Analyzing expression...</p>
                  </div>
                )}
              </div>

              {error && !isPending && (
                 <Alert variant="destructive" className="w-full mb-4">
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isPending && expression && (
                <div className="text-center animate-in fade-in zoom-in-95 duration-500 w-full">
                  <p className="text-muted-foreground">Our AI says your animal is feeling...</p>
                  <p className="text-2xl font-semibold my-4 text-foreground">"{expression}"</p>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {image && (
          <CardFooter className="bg-muted/50 p-4 flex flex-col sm:flex-row gap-2 justify-center">
             <Button onClick={handleReset} variant="outline">
              <X className="mr-2" /> Start Over
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
        <WandSparkles className="w-4 h-4 mr-2 text-primary" />
        <p>Powered by AI</p>
      </div>
    </div>
  );
}
