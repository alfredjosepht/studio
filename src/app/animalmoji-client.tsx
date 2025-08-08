
"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { getExpressionForAnimal } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, X, HelpCircle, Wand2, PartyPopper, RefreshCw, File, RotateCcw, AlertTriangle, PawPrint } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
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
      <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4 shadow-sm">
        <PawPrint className="h-4 w-4 mr-2 text-primary" />
        AI-Powered Analysis
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
        Discover Your Animal's
        <span className="block bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"> Emoji Personality</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
        Upload a photo of your furry (or scaly) friend and let our advanced AI reveal their unique expression through the perfect emoji match.
      </p>
    </div>
  );

  const UploadSection = () => (
    <Card 
        className={`max-w-2xl mx-auto transition-all duration-300 shadow-lg ${isDragging ? 'border-primary ring-4 ring-primary/20' : ''}`}
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
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
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
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Photo Preview</CardTitle>
          <Button variant="ghost" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Change</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden border shadow-inner">
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
                  // Ease out effect
                  return prev + (100 - prev) * 0.05;
              });
          }, 100);

          return () => clearInterval(interval);
      }, [isPending]);

    return (
        <Card className="max-w-2xl mx-auto text-center shadow-lg">
            <CardHeader>
                <CardTitle>Analyzing... 🐾</CardTitle>
                <CardDescription>Our AI is working its magic!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
                <div className="relative">
                    <PawPrint className="h-16 w-16 text-primary animate-spin" style={{animationDuration: '3s'}}/>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </CardContent>
        </Card>
    );
  };

  const ResultsSection = () => (
    <Card className="max-w-4xl mx-auto shadow-lg animate-fade-in-up">
        <CardHeader className="text-center">
            <div className="inline-flex items-center rounded-lg bg-green-100 text-green-800 px-3 py-1 text-sm font-medium mx-auto">
                <PartyPopper className="h-5 w-5 mr-2"/>
                <CardTitle className="text-2xl text-green-800">Analysis Complete!</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="space-y-8 p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-muted shadow-lg">
                {image && <img src={image} alt="Animal result" className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-8xl md:text-9xl p-6 bg-gradient-to-br from-background to-muted rounded-full w-48 h-48 mx-auto flex items-center justify-center shadow-inner animate-bounce-slow">
                  {emoji}
                </div>
                <p className="text-2xl font-semibold italic text-muted-foreground mt-6">"{expression}"</p>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleReset}>
                <RefreshCw className="mr-2 h-5 w-5"/>
                Analyze Another
            </Button>
        </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background font-sans antialiased relative isolate">
        <div aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-200/50 opacity-20 blur-3xl"></div>
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
