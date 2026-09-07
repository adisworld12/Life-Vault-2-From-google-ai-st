import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { VaultItem, VaultItemType, ReminderStep } from '../types';
import { getApiUrl } from '../config/api';
import { capturePhotoNative, pickPhotoFromGallery } from '../services/cameraService';
import { triggerHaptic } from '../utils/security';

interface ScannerViewProps {
  onScanComplete: (item: VaultItem) => void;
  onCancel: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanComplete,
  onCancel,
}) => {
  // Scanner modes: 'select' | 'camera' | 'processing' | 'review'
  const [mode, setMode] = useState<'select' | 'camera' | 'processing' | 'review'>('select');

  // File & Camera state
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // AI Extraction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing AI neural scanner...');
  const [progress, setProgress] = useState(10);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Review & Confirmation state
  const [extractedItem, setExtractedItem] = useState<VaultItem | null>(null);
  const [isEditingInReview, setIsEditingInReview] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    type: VaultItemType;
    title: string;
    subtitle: string;
    category: string;
    fullName: string;
    fullNumber: string;
    brand: string;
    model: string;
    serialNumber: string;
    issueDate: string;
    expiryDate: string;
    cost: string;
    currency: string;
    billingCycle: string;
    notes: string;
    selectedReminders: number[];
  }>({
    type: 'document',
    title: '',
    subtitle: '',
    category: 'Document • ID',
    fullName: '',
    fullNumber: '',
    brand: '',
    model: '',
    serialNumber: '',
    issueDate: '',
    expiryDate: '',
    cost: '',
    currency: '$',
    billingCycle: '',
    notes: '',
    selectedReminders: [180, 90, 30, 14, 7, 1],
  });

  // Stop camera on unmount or mode change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle native camera capture or fallback to WebRTC stream
  const handleStartCamera = async () => {
    try {
      // 1. Try Native Capacitor Camera
      const nativeResult = await capturePhotoNative();
      if (nativeResult) {
        setSelectedImageBase64(nativeResult.dataUrl);
        setFileName(nativeResult.name);
        setFileType(`image/${nativeResult.format}`);
        processFileWithAI(nativeResult.dataUrl, `image/${nativeResult.format}`);
        return;
      }
    } catch {
      // Continue to WebRTC camera fallback
    }

    // 2. WebRTC Live Viewfinder for Web / Fallback
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setCameraStream(stream);
      setMode('camera');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.warn);
        }
      }, 100);
    } catch {
      // Direct file input fallback
      cameraInputRef.current?.click();
    }
  };

  // Handle photo gallery selection (Native or File Picker)
  const handleSelectFromGallery = async () => {
    try {
      const nativePhoto = await pickPhotoFromGallery();
      if (nativePhoto) {
        setSelectedImageBase64(nativePhoto.dataUrl);
        setFileName(nativePhoto.name);
        setFileType(`image/${nativePhoto.format}`);
        processFileWithAI(nativePhoto.dataUrl, `image/${nativePhoto.format}`);
        return;
      }
    } catch {
      // Fall back to web file input
    }
    fileInputRef.current?.click();
  };

  // Capture frame from live video
  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Stop stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }

      setSelectedImageBase64(dataUrl);
      setFileName(`Camera_Capture_${new Date().toISOString().slice(0, 10)}.jpg`);
      setFileType('image/jpeg');
      processFileWithAI(dataUrl, 'image/jpeg');
    }
  };

  // Stop live camera
  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setMode('select');
  };

  // Handle file selection (Gallery / Files / PDFs)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type || 'image/jpeg');
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSizeStr(`${sizeInMB} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setSelectedImageBase64(base64Data);
      processFileWithAI(base64Data, file.type || 'image/jpeg');
    };
    reader.onerror = () => {
      setProcessingError('Failed to read selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Real AI extraction call to configured backend API
  const processFileWithAI = async (base64Data: string, mime: string) => {
    setMode('processing');
    setIsProcessing(true);
    setProgress(15);
    setProcessingError(null);

    const steps = [
      'Uploading high-resolution document...',
      'Running Google Gemini neural vision OCR...',
      'Extracting document type & authority...',
      'Parsing names, IDs, dates & validity periods...',
      'Analyzing warranty & recurring billing details...',
      'Finalizing cryptographic audit...',
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
      setStatusMessage(steps[currentStep]);
      setProgress((prev) => Math.min(prev + 12, 92));
    }, 900);

    try {
      const endpoint = getApiUrl('/api/scan-document');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mime,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'AI scanning is currently unavailable. Please try again.';
        throw new Error(errorMsg);
      }

      const extracted = data.extracted || {};

      const itemType: VaultItemType = extracted.type || 'document';
      const extractedTitle = extracted.title || fileName.replace(/\.[^/.]+$/, '') || 'Scanned Document';
      const extractedSub = extracted.subtitle || `${itemType.toUpperCase()} Record`;
      const extractedCat = extracted.category || (itemType === 'warranty' ? 'Hardware Warranty' : itemType === 'subscription' ? 'Subscription • Software' : 'Document • ID');
      const extractedName = extracted.fullName || '';
      const extractedNumber = extracted.fullNumber || extracted.serialNumber || '';
      const extractedBrand = extracted.brand || '';
      const extractedModel = extracted.model || '';
      const extractedSerial = extracted.serialNumber || '';
      const extractedIssue = extracted.issueDate || '';
      const extractedExpiry = extracted.expiryDate || '';
      const extractedCost = extracted.cost !== undefined && extracted.cost !== null ? String(extracted.cost) : '';
      const extractedCurrency = extracted.currency || '$';
      const extractedCycle = extracted.billingCycle || (itemType === 'subscription' ? 'Monthly' : '');
      const extractedNotes = extracted.notes || '';

      // Calculate days remaining if expiryDate present
      let urgencyDays: number | undefined = undefined;
      if (extractedExpiry) {
        const expDate = new Date(extractedExpiry);
        if (!isNaN(expDate.getTime())) {
          const diffMs = expDate.getTime() - Date.now();
          urgencyDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }

      const suggestedReminderDays = [180, 90, 30, 14, 7, 1];

      // Populate review form
      setReviewForm({
        type: itemType,
        title: extractedTitle,
        subtitle: extractedSub,
        category: extractedCat,
        fullName: extractedName,
        fullNumber: extractedNumber,
        brand: extractedBrand,
        model: extractedModel,
        serialNumber: extractedSerial,
        issueDate: extractedIssue,
        expiryDate: extractedExpiry,
        cost: extractedCost,
        currency: extractedCurrency,
        billingCycle: extractedCycle,
        notes: extractedNotes,
        selectedReminders: suggestedReminderDays,
      });

      const fullItem: VaultItem = {
        id: `scan-${Date.now()}`,
        type: itemType,
        title: extractedTitle,
        subtitle: extractedSub,
        category: extractedCat,
        fullName: extractedName,
        fullNumber: extractedNumber,
        brand: extractedBrand,
        model: extractedModel,
        serialNumber: extractedSerial,
        maskedNumber: extractedNumber ? `•••••${extractedNumber.slice(-4)}` : undefined,
        issueDate: extractedIssue,
        expiryDate: extractedExpiry,
        cost: extractedCost ? parseFloat(extractedCost) : undefined,
        currency: extractedCurrency,
        billingCycle: extractedCycle,
        notes: extractedNotes,
        scanImageUrl: base64Data,
        fileName: fileName,
        fileType: mime,
        fileSize: fileSizeStr,
        status: urgencyDays !== undefined && urgencyDays <= 30 ? 'attention' : 'active',
        urgencyDays: urgencyDays,
        urgencyText: urgencyDays !== undefined ? `Expires in ${urgencyDays} days` : undefined,
        iconName: extracted.iconName || (itemType === 'subscription' ? 'subscriptions' : itemType === 'warranty' ? 'verified_user' : 'description'),
        createdAt: new Date().toISOString(),
        tags: ['AI_SCANNED', itemType.toUpperCase()],
        reminders: suggestedReminderDays.map((d) => ({
          id: `rem-${d}-${Date.now()}`,
          daysBefore: d,
          dateStr: `${d} days before expiry`,
          label: `${d} days before expiry`,
          status: 'upcoming' as const,
        })),
      };

      setExtractedItem(fullItem);
      setIsProcessing(false);
      setMode('review');
      await triggerHaptic('success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      await triggerHaptic('error');
      setProcessingError(err?.message || 'AI scanning is currently unavailable. Please try again.');
    }
  };

  // Fallback to manual entry with uploaded image attached (NO fake data)
  const handleManualEntryFallback = () => {
    const defaultTitle = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'New Vault Item';
    const fallbackItem: VaultItem = {
      id: `manual-${Date.now()}`,
      type: 'document',
      title: defaultTitle,
      subtitle: 'Manual Entry',
      category: 'Document • General',
      scanImageUrl: selectedImageBase64 || undefined,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
      fileSize: fileSizeStr || undefined,
      status: 'active',
      iconName: 'description',
      createdAt: new Date().toISOString(),
      tags: ['MANUAL'],
      reminders: [180, 90, 30, 14, 7, 1].map((d) => ({
        id: `rem-${d}-${Date.now()}`,
        daysBefore: d,
        dateStr: `${d} days before expiry`,
        label: `${d} days before expiry`,
        status: 'upcoming' as const,
      })),
    };

    setReviewForm({
      type: 'document',
      title: defaultTitle,
      subtitle: 'Personal Record',
      category: 'Document • General',
      fullName: '',
      fullNumber: '',
      brand: '',
      model: '',
      serialNumber: '',
      issueDate: '',
      expiryDate: '',
      cost: '',
      currency: '$',
      billingCycle: '',
      notes: '',
      selectedReminders: [180, 90, 30, 14, 7, 1],
    });

    setExtractedItem(fallbackItem);
    setIsEditingInReview(true);
    setMode('review');
  };

  // Toggle reminder days in review screen
  const handleToggleReminderDay = (day: number) => {
    setReviewForm((prev) => {
      const exists = prev.selectedReminders.includes(day);
      return {
        ...prev,
        selectedReminders: exists
          ? prev.selectedReminders.filter((d) => d !== day)
          : [...prev.selectedReminders, day].sort((a, b) => b - a),
      };
    });
  };

  // Confirm and save to Vault
  const handleConfirmAndSave = async () => {
    if (!extractedItem) return;

    let urgencyDays: number | undefined = undefined;
    if (reviewForm.expiryDate) {
      const expDate = new Date(reviewForm.expiryDate);
      if (!isNaN(expDate.getTime())) {
        const diffMs = expDate.getTime() - Date.now();
        urgencyDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    }

    const reminderSteps: ReminderStep[] = reviewForm.selectedReminders.map((d) => ({
      id: `rem-${d}-${Date.now()}`,
      daysBefore: d,
      dateStr: `${d} days before expiry`,
      label: `${d} days before expiry`,
      status: 'upcoming' as const,
    }));

    const finalItem: VaultItem = {
      ...extractedItem,
      type: reviewForm.type,
      title: reviewForm.title.trim() || 'Scanned Item',
      subtitle: reviewForm.subtitle.trim() || `${reviewForm.type.toUpperCase()} Record`,
      category: reviewForm.category.trim() || 'General Vault',
      fullName: reviewForm.fullName.trim() || undefined,
      fullNumber: reviewForm.fullNumber.trim() || undefined,
      brand: reviewForm.brand.trim() || undefined,
      model: reviewForm.model.trim() || undefined,
      serialNumber: reviewForm.serialNumber.trim() || undefined,
      maskedNumber: reviewForm.fullNumber ? `•••••${reviewForm.fullNumber.slice(-4)}` : undefined,
      issueDate: reviewForm.issueDate.trim() || undefined,
      expiryDate: reviewForm.expiryDate.trim() || undefined,
      cost: reviewForm.cost ? parseFloat(reviewForm.cost) : undefined,
      currency: reviewForm.currency || '$',
      billingCycle: reviewForm.billingCycle || undefined,
      notes: reviewForm.notes.trim() || 'Processed via LifeVault.',
      urgencyDays: urgencyDays,
      urgencyText: urgencyDays !== undefined ? (urgencyDays < 0 ? 'Expired' : `Expires in ${urgencyDays} days`) : undefined,
      status: urgencyDays !== undefined && urgencyDays <= 30 ? 'attention' : 'active',
      reminders: reminderSteps,
    };

    await triggerHaptic('success');
    onScanComplete(finalItem);
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-8 relative max-w-xl mx-auto pb-32">
      {/* Hidden file inputs for Camera and File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* MODE 1: SELECT SCAN METHOD */}
      {mode === 'select' && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
              <span className="material-symbols-outlined text-[32px]">document_scanner</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Real Document Scanner
            </h1>
            <p className="text-xs md:text-sm text-white/50 max-w-md mx-auto">
              Capture or upload IDs, passports, receipts, warranties, and subscription bills. Our secure Gemini AI automatically extracts key fields.
            </p>
          </div>

          {/* Three Core Scanning Methods */}
          <div className="space-y-3.5">
            {/* Option 1: Camera Scan */}
            <div
              id="btn-scan-document-camera"
              onClick={handleStartCamera}
              className="p-5 bg-[#1a1a1a] hover:bg-[#222222] border border-white/10 hover:border-indigo-500/50 rounded-[2rem] shadow-xl cursor-pointer flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">photo_camera</span>
                </div>
                <div>
                  <div className="text-base font-bold text-white group-hover:text-indigo-400 flex items-center gap-2">
                    Scan Document
                    <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full">
                      Camera
                    </span>
                  </div>
                  <div className="text-xs text-white/50">
                    Use native device camera with instant alignment viewfinder
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                arrow_forward_ios
              </span>
            </div>

            {/* Option 2: Upload Photo / Gallery */}
            <div
              id="btn-upload-pdf-image"
              onClick={handleSelectFromGallery}
              className="p-5 bg-[#1a1a1a] hover:bg-[#222222] border border-white/10 hover:border-emerald-500/50 rounded-[2rem] shadow-xl cursor-pointer flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">image</span>
                </div>
                <div>
                  <div className="text-base font-bold text-white group-hover:text-emerald-400 flex items-center gap-2">
                    Upload from Gallery
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Photos
                    </span>
                  </div>
                  <div className="text-xs text-white/50">
                    Select high-resolution photos from your device photo library
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                arrow_forward_ios
              </span>
            </div>

            {/* Option 3: Import PDF / Storage Files */}
            <div
              id="btn-import-from-files"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 bg-[#1a1a1a] hover:bg-[#222222] border border-white/10 hover:border-amber-500/50 rounded-[2rem] shadow-xl cursor-pointer flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">folder_open</span>
                </div>
                <div>
                  <div className="text-base font-bold text-white group-hover:text-amber-400 flex items-center gap-2">
                    Import PDF & Files
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      Storage
                    </span>
                  </div>
                  <div className="text-xs text-white/50">
                    Browse system files, PDF contracts, and digital invoices
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                arrow_forward_ios
              </span>
            </div>
          </div>

          {/* AI Privacy & Security Notice */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-400 text-[22px] shrink-0">
              verified_user
            </span>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Documents are processed securely via server-side Google Gemini Vision. API keys are strictly protected on the backend.
            </p>
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full py-3 text-center text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Cancel and Return
          </button>
        </div>
      )}

      {/* MODE 2: LIVE CAMERA VIEWFINDER (Web fallback) */}
      {mode === 'camera' && (
        <div className="w-full space-y-4 animate-fadeIn">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/20 bg-black aspect-[3/4] max-h-[60vh] flex items-center justify-center shadow-2xl">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Document Frame Overlay */}
            <div className="absolute inset-6 border-2 border-dashed border-indigo-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-indigo-400" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-indigo-400" />
              </div>
              <div className="text-center bg-black/60 backdrop-blur-sm text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mx-auto">
                Align document inside frame
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-indigo-400" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-indigo-400" />
              </div>
            </div>

            {/* Close camera button */}
            <button
              onClick={stopLiveCamera}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-black transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Camera Controls */}
          <div className="flex items-center justify-around pt-2">
            <button
              onClick={stopLiveCamera}
              className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            {/* Capture shutter button */}
            <button
              id="shutter-capture-btn"
              onClick={captureLiveFrame}
              className="w-18 h-18 rounded-full bg-white flex items-center justify-center p-1.5 shadow-2xl shadow-white/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-full h-full rounded-full border-4 border-black bg-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px]">
                  photo_camera
                </span>
              </div>
            </button>

            <button
              onClick={handleSelectFromGallery}
              className="px-4 py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              From Gallery
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: PROCESSING AI SCREEN */}
      {mode === 'processing' && (
        <div className="w-full flex flex-col items-center justify-center space-y-8 my-auto animate-fadeIn">
          {/* Scanning Animation */}
          <div className="relative flex items-center justify-center w-36 h-36 mb-4">
            <div className="absolute inset-0 bg-indigo-600/30 rounded-full pulse-ring" />
            <div
              className="absolute inset-0 bg-indigo-600/20 rounded-full pulse-ring"
              style={{ animationDelay: '0.8s' }}
            />
            <div className="absolute inset-2 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/50 border border-indigo-400/40">
              <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center shadow-inner border border-white/10">
                <span className="material-symbols-outlined text-indigo-400 text-[36px]">
                  document_scanner
                </span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Document Analysis
            </h2>
            <p className="text-xs text-white/60 h-6 font-medium transition-all duration-300">
              {processingError ? 'Scanning interrupted' : statusMessage}
            </p>

            {/* Animated Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative mt-6 border border-white/5">
              <div
                className={`h-full ${processingError ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Error Message Box */}
            {processingError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs mt-4 text-center space-y-1">
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  Scan Notification
                </div>
                <div>{processingError}</div>
              </div>
            )}
          </div>

          <div className="pt-6 w-full max-w-sm flex flex-col gap-3">
            {processingError ? (
              <div className="space-y-2 w-full">
                <button
                  onClick={() => {
                    if (selectedImageBase64) {
                      processFileWithAI(selectedImageBase64, fileType);
                    } else {
                      setMode('select');
                    }
                  }}
                  className="w-full py-3.5 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Try Again
                </button>
                <button
                  onClick={handleManualEntryFallback}
                  className="w-full py-3.5 rounded-full text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Enter Details Manually
                </button>
                <button
                  onClick={() => setMode('select')}
                  className="w-full py-2.5 rounded-full text-white/50 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Choose Different Document
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMode('select')}
                className="w-full py-3 rounded-full text-white/60 hover:text-white text-xs font-bold bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODE 4: AI REVIEW & CONFIRMATION SCREEN */}
      {mode === 'review' && extractedItem && (
        <div className="w-full space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
              <span className="material-symbols-outlined text-[28px]">verified</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Review & Confirm
            </h2>
            <p className="text-xs text-white/50">
              Verify extracted details before saving to your encrypted vault.
            </p>
          </div>

          {/* Attached Document Preview Thumbnail */}
          {selectedImageBase64 && (
            <div className="p-3 bg-[#161616] border border-white/10 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                <img
                  src={selectedImageBase64}
                  alt="Scanned thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {fileName || 'Scanned Document Image'}
                </div>
                <div className="text-[10px] text-white/40">
                  {fileType} {fileSizeStr && `• ${fileSizeStr}`}
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded-md border border-emerald-500/30">
                Attached
              </span>
            </div>
          )}

          {/* Form / Extracted Fields */}
          <div className="bg-[#181818] border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white/50 tracking-wider uppercase">
                Document Classification
              </span>
              <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                {(['document', 'subscription', 'warranty'] as VaultItemType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, type: t })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                      reviewForm.type === t
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-white/60 mb-1">
                  Document / Item Title *
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="e.g. United States Passport"
                  className="w-full bg-[#121212] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={reviewForm.category}
                    onChange={(e) => setReviewForm({ ...reviewForm, category: e.target.value })}
                    placeholder="e.g. Document • ID"
                    className="w-full bg-[#121212] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1">
                    Cardholder / Owner
                  </label>
                  <input
                    type="text"
                    value={reviewForm.fullName}
                    onChange={(e) => setReviewForm({ ...reviewForm, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#121212] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Document Number & Dates */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-[11px] font-bold text-white/60 mb-1">
                  Document / Policy #
                </label>
                <input
                  type="text"
                  value={reviewForm.fullNumber}
                  onChange={(e) => setReviewForm({ ...reviewForm, fullNumber: e.target.value })}
                  placeholder="e.g. A9283719"
                  className="w-full bg-[#121212] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white/60 mb-1">
                  Expiry / Renewal Date
                </label>
                <input
                  type="text"
                  value={reviewForm.expiryDate}
                  onChange={(e) => setReviewForm({ ...reviewForm, expiryDate: e.target.value })}
                  placeholder="e.g. Oct 15, 2029"
                  className="w-full bg-[#121212] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            {reviewForm.type === 'subscription' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1">
                    Cost & Currency
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reviewForm.currency}
                      onChange={(e) => setReviewForm({ ...reviewForm, currency: e.target.value })}
                      placeholder="$"
                      className="w-12 bg-[#121212] border border-white/10 text-center rounded-xl py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={reviewForm.cost}
                      onChange={(e) => setReviewForm({ ...reviewForm, cost: e.target.value })}
                      placeholder="14.99"
                      className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={reviewForm.billingCycle}
                    onChange={(e) => setReviewForm({ ...reviewForm, billingCycle: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
            )}

            {reviewForm.type === 'warranty' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={reviewForm.brand}
                    onChange={(e) => setReviewForm({ ...reviewForm, brand: e.target.value })}
                    placeholder="e.g. Apple"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={reviewForm.serialNumber}
                    onChange={(e) => setReviewForm({ ...reviewForm, serialNumber: e.target.value })}
                    placeholder="e.g. C02G..."
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>
            )}

            {/* Reminder Schedules */}
            <div className="pt-3 border-t border-white/10">
              <label className="block text-[11px] font-bold text-white/60 mb-2">
                Automated Native OS Reminders (Scheduled Alarms)
              </label>
              <div className="flex flex-wrap gap-2">
                {[180, 90, 30, 14, 7, 1].map((day) => {
                  const isSelected = reviewForm.selectedReminders.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleReminderDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-black/30 border-white/10 text-white/40 hover:text-white/70'
                      }`}
                    >
                      {day}d before
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setMode('select')}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              Discard & Re-scan
            </button>
            <button
              id="confirm-save-vault-btn"
              onClick={handleConfirmAndSave}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Save to Vault
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
