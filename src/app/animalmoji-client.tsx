"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { getExpressionForAnimal } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, X, HelpCircle, Image as ImageIcon, Wand2, PartyPopper, RefreshCw, File, ServerCrash, RotateCcw, AlertTriangle, PawPrint } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

type AppState = 'upload' | 'preview' | 'analyzing' | 'results';

export default function AnimalMojiClient() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [expression, setExpression] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file (PNG, JPG, etc.).",
      })
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setFileName(file.name);
      setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
      setError(null);
      setAppState('preview');
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    setAppState('analyzing');
    startTransition(async () => {
      const result = await getExpressionForAnimal(image);
      if (result.success) {
        setExpression(result.expression);
        setEmoji(result.emoji);
        setAppState('results');
      } else {
        setError(result.error ?? 'An unknown error occurred.');
        setAppState('preview');
      }
    });
  };

  const handleReset = () => {
    setImage(null);
    setFileName('');
    setFileSize('');
    setExpression(null);
    setEmoji(null);
    setError(null);
    setAppState('upload');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const AppHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">AnimalMoji</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How It Works</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 mt-4 text-left">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Upload Photo</h4>
                      <p className="text-sm text-muted-foreground">Choose a clear, well-lit photo of your animal's face.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">AI Analysis</h4>
                      <p className="text-sm text-muted-foreground">Our AI analyzes facial expressions and features.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Get Results</h4>
                      <p className="text-sm text-muted-foreground">Discover your animal's emoji personality match!</p>
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );

  const HeroSection = () => (
    <div className="text-center my-12 md:my-20">
      <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4">
        <PawPrint className="h-4 w-4 mr-2 text-primary" />
        AI-Powered Analysis
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
        Discover Your Animal's
        <span className="block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">😻 Emoji Personality</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
        Upload a photo of your furry (or scaly) friend and let our advanced AI reveal their unique expression through the perfect emoji match.
      </p>
    </div>
  );

  const UploadSection = () => (
    <Card 
        className={`max-w-2xl mx-auto transition-all duration-300 ${isDragging ? 'border-primary shadow-lg' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <CardHeader className="text-center">
        <CardTitle>Upload Your Animal's Photo 🐾</CardTitle>
        <CardDescription>For best results, use a clear photo of the animal's face.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent hover:border-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mb-4"/>
          <p className="font-semibold">Drag & drop or click to upload</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, WEBP. Max 10MB.</p>
          <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)} />
        </div>
        <Button className="w-full" size="lg" onClick={() => fileInputRef.current?.click()}>
          <PawPrint className="mr-2 h-5 w-5"/>
          Choose Photo
        </Button>
      </CardContent>
    </Card>
  );

  const PreviewSection = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Photo Preview</CardTitle>
          <Button variant="ghost" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Change</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
          {image && <img src={image} alt="Animal preview" className="w-full h-full object-cover" />}
           <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center text-sm bg-muted p-3 rounded-lg">
          <File className="h-5 w-5 mr-3 text-muted-foreground" />
          <p className="font-mono text-xs truncate mr-4 flex-1">{fileName}</p>
          <p className="font-semibold">{fileSize}</p>
        </div>
         {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
         )}
        <Button className="w-full" size="lg" onClick={handleAnalyze}>
          <Wand2 className="mr-2 h-5 w-5"/>
          Analyze Personality
        </Button>
      </CardContent>
    </Card>
  );

    const AnalysisSection = () => {
      const [progress, setProgress] = useState(0);

      useEffect(() => {
          const interval = setInterval(() => {
              setProgress(prev => {
                  if (prev >= 99) {
                    if(!isPending) clearInterval(interval);
                    return 99;
                  }
                  return prev + 1
              });
          }, 50);

          return () => clearInterval(interval);
      }, [isPending]);

    return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CardTitle>Analyzing... 🐾</CardTitle>
                <CardDescription>Our AI is working its magic!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
                <div className="relative">
                    <PawPrint className="h-16 w-16 text-primary animate-spin"/>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </CardContent>
        </Card>
    );
  };

  const ResultsSection = () => (
    <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
            <div className="flex justify-center items-center">
                <PartyPopper className="h-6 w-6 mr-2 text-green-500"/>
                <CardTitle>Analysis Complete!</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
            <div className="text-8xl p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-48 h-48 mx-auto flex items-center justify-center shadow-inner animate-bounce">
              {emoji}
            </div>
            <p className="text-2xl font-semibold italic text-muted-foreground">"{expression}"</p>
            <Button className="w-full" size="lg" onClick={handleReset}>
                <RefreshCw className="mr-2 h-5 w-5"/>
                Analyze Another
            </Button>
        </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#fbe2e3,transparent)]"></div>
        </div>

      <AppHeader />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {appState !== 'analyzing' && appState !== 'results' && <HeroSection />}
        {appState === 'upload' && <UploadSection />}
        {appState === 'preview' && <PreviewSection />}
        {appState === 'analyzing' && <AnalysisSection />}
        {appState === 'results' && <ResultsSection />}
      </main>

    </div>
  );
}
