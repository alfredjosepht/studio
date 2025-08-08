"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { getExpressionForAnimal } from './actions';

// Define states for the application
type AppState = 'upload' | 'preview' | 'analyzing' | 'results';

export default function AnimalMojiClient() {
  // State management
  const [appState, setAppState] = useState<AppState>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [expression, setExpression] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // Refs for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // File handling
  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
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
  
  // Drag and drop events
  useEffect(() => {
    const uploadArea = uploadAreaRef.current;
    if (!uploadArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    };
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    return () => {
      uploadArea.removeEventListener('dragover', handleDragOver);
      uploadArea.removeEventListener('dragleave', handleDragLeave);
      uploadArea.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Analysis logic
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
        setAppState('preview'); // Go back to preview on error
      }
    });
  };

  // Reset logic
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

  // UI Components
  const AppHeader = () => (
    <header className="app-header">
      <nav className="nav-container">
        <div className="nav-brand">
          <div className="brand-icon">🎭</div>
          <span className="brand-text">Animal Emojifier</span>
        </div>
        <div className="nav-actions">
          <button id="helpBtn" className="nav-btn" aria-label="Help" onClick={() => setHelpModalOpen(true)}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9,9a3,3 0 1,1 6,0c0,2 -3,3 -3,3"></path>
              <path d="m12,17 l.01,0"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );

  const HeroSection = () => (
    <section id="heroSection" className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-icon">✨</span>
          <span className="badge-text">AI-Powered Analysis</span>
        </div>
        <h1 className="hero-title">
          Discover Your Animal's
          <span className="title-highlight"> Emoji Personality</span>
        </h1>
        <p className="hero-description">
          Upload a photo of your furry friend and let our advanced AI reveal their unique personality through the perfect emoji match.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Animals Analyzed</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </section>
  );

  const UploadSection = () => (
    <section id="uploadSection" className="upload-section">
      <div className="section-container">
        <div className="upload-card">
          <div className="upload-header">
            <h2 className="section-title">Upload Your Animal's Photo</h2>
            <p className="section-subtitle">Best results with clear, well-lit photos showing your animal's face</p>
          </div>
          
          <div id="uploadArea" ref={uploadAreaRef} className={`upload-area ${isDragging ? 'drag-over' : ''}`} onClick={() => fileInputRef.current?.click()}>
            <div className="upload-content">
              <div className="upload-icon-container">
                <div className="upload-icon">📸</div>
                <div className="upload-pulse"></div>
              </div>
              <h3 className="upload-title">Drop your photo here</h3>
              <p className="upload-subtitle">or click to browse files</p>
              <div className="upload-specs">
                <span className="spec-item">• JPG, PNG, or WEBP</span>
                <span className="spec-item">• Max 10MB</span>
                <span className="spec-item">• Square format preferred</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} id="imageUpload" accept="image/*" hidden onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)} />
          </div>
          
          <button id="uploadBtn" className="btn btn-primary btn-large" onClick={() => fileInputRef.current?.click()}>
            <span className="btn-icon">📷</span>
            <span className="btn-text">Choose Photo</span>
          </button>
        </div>
      </div>
    </section>
  );

  const PreviewSection = () => (
    <section id="previewSection" className="preview-section">
        <div className="section-container">
            <div className="preview-card">
                <div className="preview-header">
                    <h2 className="section-title">Photo Preview</h2>
                    <button id="changePhotoBtn" className="btn btn-outline btn-small" onClick={handleReset}>
                        <span className="btn-icon">🔄</span>
                        <span className="btn-text">Change Photo</span>
                    </button>
                </div>
                
                <div className="image-preview-container">
                    <div className="image-wrapper">
                        {image && <img id="previewImage" alt="Animal preview" className="preview-image" src={image} />}
                        <div className="image-overlay">
                             <button id="removeBtn" className="remove-btn" aria-label="Remove image" onClick={handleReset}>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="image-info">
                        <div className="info-item">
                            <span className="info-label">File:</span>
                            <span id="fileName" className="info-value">{fileName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Size:</span>
                            <span id="fileSize" className="info-value">{fileSize}</span>
                        </div>
                        <div className="quality-indicator">
                            <span className="quality-label">Quality:</span>
                            <div className="quality-bars">
                                <div className="quality-bar active"></div>
                                <div className="quality-bar active"></div>
                                <div className="quality-bar active"></div>
                                <div className="quality-bar"></div>
                                <div className="quality-bar"></div>
                            </div>
                            <span className="quality-text">Good</span>
                        </div>
                    </div>
                </div>
                 {error && (
                    <div style={{ color: 'var(--error-500)', marginBottom: 'var(--space-4)'}}>
                        <strong>Analysis Failed:</strong> {error}
                    </div>
                 )}
                <div className="preview-actions">
                    <button id="analyzeBtn" className="btn btn-success btn-large" onClick={handleAnalyze}>
                        <span className="btn-icon">🔮</span>
                        <span className="btn-text">Analyze Personality</span>
                        <div className="btn-shine"></div>
                    </button>
                </div>
            </div>
        </div>
    </section>
  );

    const AnalysisSection = () => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState('Initializing...');

    useEffect(() => {
        const steps = ['Uploading image', 'Detecting features', 'AI analysis', 'Generating results'];
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 1;
            setProgress(currentProgress);
            
            if (currentProgress < 25) setStep(steps[0]);
            else if (currentProgress < 50) setStep(steps[1]);
            else if (currentProgress < 75) setStep(steps[2]);
            else if (currentProgress < 100) setStep(steps[3]);

            if (currentProgress >= 100) {
                 if(!isPending) clearInterval(interval);
                 else currentProgress = 99; // Hold at 99% until backend is done
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isPending]);

    return (
        <section id="analysisSection" className="analysis-section">
            <div className="section-container">
                <div className="analysis-card">
                    <div className="analysis-visual">
                        <div className="scanning-animation">
                            <div className="scan-circle">
                                <div className="scan-line"></div>
                            </div>
                        </div>
                        <div className="analysis-pet-icon">🐾</div>
                    </div>
                    
                    <div className="analysis-content">
                        <h2 className="analysis-title">Analyzing Your Animal's Personality</h2>
                        <p className="analysis-subtitle">Our AI is examining facial features, expressions, and body language...</p>
                        
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div className="progress-fill" id="progressFill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="progress-text">
                                <span id="progressPercent">{progress}%</span>
                                <span id="progressStep">{step}</span>
                            </div>
                        </div>
                        
                        <div className="analysis-steps">
                            <div className={`step-item ${progress >= 0 ? 'active' : ''}`}>
                                <div className="step-icon">📤</div>
                                <span className="step-text">Uploading</span>
                            </div>
                            <div className={`step-item ${progress >= 25 ? 'active' : ''}`}>
                                <div className="step-icon">🔍</div>
                                <span className="step-text">Detecting</span>
                            </div>
                            <div className={`step-item ${progress >= 50 ? 'active' : ''}`}>
                                <div className="step-icon">🧠</div>
                                <span className="step-text">AI analysis</span>
                            </div>
                            <div className={`step-item ${progress >= 75 ? 'active' : ''}`}>
                                <div className="step-icon">✨</div>
                                <span className="step-text">Generating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
  };

  const ResultsSection = () => (
    <section id="resultsSection" className="results-section">
      <div className="section-container">
        <div className="results-card">
          <div className="results-header">
            <div className="success-badge">
              <span className="badge-icon">✅</span>
              <span className="badge-text">Analysis Complete</span>
            </div>
          </div>
          
          <div className="personality-display">
            <div className="emoji-container">
              <div className="emoji-result" id="emojiResult">{emoji}</div>
            </div>
            
            <div className="personality-info">
              <p id="personalityDesc" className="personality-description">"{expression}"</p>
            </div>
          </div>
          
          <div className="results-actions">
            <button id="newAnalysisBtn" className="btn btn-primary" onClick={handleReset}>
              <span className="btn-icon">🔄</span>
              <span className="btn-text">New Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const AppFooter = () => (
    <footer className="app-footer">
        <div className="footer-content">
            <div className="footer-info">
                <p>Made with ❤️ using Firebase & AI</p>
            </div>
        </div>
    </footer>
  );

  const HelpModal = () => (
    <div id="helpModal" className={`modal ${isHelpModalOpen ? '' : 'hidden'}`}>
      <div className="modal-overlay" onClick={() => setHelpModalOpen(false)}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">How It Works</h3>
          <button id="closeHelpBtn" className="modal-close" aria-label="Close" onClick={() => setHelpModalOpen(false)}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="help-steps">
            <div className="help-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Upload Photo</h4>
                <p>Choose a clear, well-lit photo of your animal's face</p>
              </div>
            </div>
            <div className="help-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>AI Analysis</h4>
                <p>Our AI analyzes facial expressions and features</p>
              </div>
            </div>
            <div className="help-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Get Results</h4>
                <p>Discover your animal's emoji personality match!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render logic
  return (
    <div id="app" className="app-container">
      <div className="background-pattern"></div>
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <AppHeader />

      <main className="main-content">
        {appState !== 'analyzing' && appState !== 'results' && <HeroSection />}
        {appState === 'upload' && <UploadSection />}
        {appState === 'preview' && <PreviewSection />}
        {appState === 'analyzing' && <AnalysisSection />}
        {appState === 'results' && <ResultsSection />}
      </main>

      <AppFooter />
      <HelpModal />
    </div>
  );
}
