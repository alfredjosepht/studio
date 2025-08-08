"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2, Copy, X, PawPrint, WandSparkles } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getEmojiForAnimal } from './actions';
import { cn } from '@/lib/utils';

const ALTERNATIVE_EMOJIS = ['😀', '😂', '😍', '😴', '🤔', '😠', '😮'];

type AnimalMojiClientProps = {
  initialEmoji: string | null;
};

export default function AnimalMojiClient({ initialEmoji }: AnimalMojiClientProps) {
  const [image, setImage] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(initialEmoji);
  const [comment, setComment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialEmoji) {
      setEmoji(initialEmoji);
    }
  }, [initialEmoji]);

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
      setEmoji(null);
      setComment(null);

      startTransition(async () => {
        const result = await getEmojiForAnimal(dataUrl);
        if (result.success) {
          setEmoji(result.emoji);
          setComment(result.comment);
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
    setEmoji(null);
    setComment(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    if (emoji) {
      url.searchParams.set('emoji', emoji);
    } else {
      url.searchParams.delete('emoji');
    }
    
    navigator.clipboard.writeText(url.toString());
    toast({
      title: 'Link Copied!',
      description: 'You can now share your animal\'s emoji with friends.',
    });
  };

  const currentEmojis = emoji ? [...new Set([emoji, ...ALTERNATIVE_EMOJIS])] : ALTERNATIVE_EMOJIS;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center mb-4">
            <PawPrint className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">AnimalMoji</h1>
        <p className="mt-2 text-lg text-muted-foreground">What's your animal really thinking? Upload a pic to find out!</p>
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
                    <p className="text-lg font-semibold">Analyzing personality...</p>
                  </div>
                )}
              </div>

              {error && !isPending && (
                 <Alert variant="destructive" className="w-full mb-4">
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isPending && emoji && (
                <div className="text-center animate-in fade-in zoom-in-95 duration-500 w-full">
                  <p className="text-muted-foreground">Our AI says your animal is feeling...</p>
                  <p className="text-8xl my-4">{emoji}</p>
                  {comment && (
                    <p className="text-lg text-foreground mb-6">"{comment}"</p>
                  )}
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Not quite right? Pick another!</p>
                    <div className="flex justify-center flex-wrap gap-2">
                      {currentEmojis.map((e) => (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={cn(
                            "text-3xl p-2 rounded-full transition-all duration-200",
                            e === emoji ? 'bg-primary/20 scale-125' : 'hover:bg-accent'
                          )}
                          aria-label={`Select emoji ${e}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
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
            <Button onClick={handleCopyLink} disabled={!emoji || isPending}>
              <Copy className="mr-2" /> Copy Share Link
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
