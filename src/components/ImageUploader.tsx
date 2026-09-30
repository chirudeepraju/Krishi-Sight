import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  SwitchCamera,
  Smartphone,
  Video,
  HelpCircle,
} from 'lucide-react';

interface ImageUploaderProps {
  selectedImage: string | null;
  onImageSelected: (base64: string, mimeType: string) => void;
  onClearImage: () => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  onImageSelected,
  onClearImage,
  disabled = false,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  }, []);

  // Start camera with graceful constraint fallbacks & automatic native camera fallback
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    setIsStartingCamera(true);

    // Check if mediaDevices is supported in current context (e.g. https or permissions)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsStartingCamera(false);
      // Automatically fallback to device camera file input
      nativeCameraInputRef.current?.click();
      return;
    }

    let stream: MediaStream | null = null;

    // Strategy 1: High-res environment facing constraint
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    } catch (e1: any) {
      // If permission was explicitly denied, do not spam attempts - open native camera
      if (
        e1?.name === 'NotAllowedError' ||
        e1?.name === 'PermissionDeniedError' ||
        e1?.message?.toLowerCase().includes('denied') ||
        e1?.message?.toLowerCase().includes('permission')
      ) {
        setCameraError(
          'Browser camera permission was denied or restricted. You can take a photo directly using your device camera app or choose from files.'
        );
        setIsStartingCamera(false);
        // Automatically open the native camera input for the user
        setTimeout(() => {
          nativeCameraInputRef.current?.click();
        }, 150);
        return;
      }

      // Strategy 2: Simple facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
      } catch (e2: any) {
        // Strategy 3: Basic generic video constraint
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (e3: any) {
          console.warn('In-browser camera stream unavailable, opening native camera picker:', e3?.message);
          setCameraError(
            'In-browser camera stream unavailable. You can take a photo with your device camera or upload an image.'
          );
          setIsStartingCamera(false);
          // Seamlessly fallback to native camera
          setTimeout(() => {
            nativeCameraInputRef.current?.click();
          }, 150);
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsStartingCamera(false);
    }
  };

  // Attach stream to video element whenever isCameraActive is true and videoRef is rendered
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video
          .play()
          .catch((err) => console.warn('Video playback autoplay notice:', err));
      };
    }
  }, [isCameraActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacing === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onImageSelected(dataUrl, 'image/jpeg');
      stopCamera();
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type || 'image/jpeg');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Crop Leaf / Plant Photo</h2>
            <p className="text-xs text-stone-500">Capture close-up of infected leaves, stem lesions, or pests</p>
          </div>
        </div>

        {selectedImage && (
          <button
            type="button"
            onClick={onClearImage}
            disabled={disabled}
            className="text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Remove Photo
          </button>
        )}
      </div>

      {/* Main Box: Preview / Camera / Dropzone */}
      <div className="relative">
        {/* Selected Image Preview */}
        {selectedImage && !isCameraActive && (
          <div className="relative rounded-xl overflow-hidden bg-stone-900 border border-stone-300 aspect-[4/3] sm:aspect-[16/9] max-h-[360px] flex items-center justify-center group">
            <img
              src={selectedImage}
              alt="Uploaded plant specimen"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md border border-stone-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Specimen Ready for Analysis
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                disabled={disabled}
                className="bg-white/95 hover:bg-white text-stone-900 text-xs px-3 py-1.5 rounded-lg shadow font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                Retake Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="bg-white/95 hover:bg-white text-stone-900 text-xs px-3 py-1.5 rounded-lg shadow font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                Change File
              </button>
            </div>
          </div>
        )}

        {/* Live Camera View */}
        {isCameraActive && (
          <div className="relative rounded-xl overflow-hidden bg-stone-950 aspect-[4/3] sm:aspect-[16/9] max-h-[360px] flex items-center justify-center">
            {shutterFlash && (
              <div className="absolute inset-0 bg-white z-20 animate-out fade-out duration-200 pointer-events-none" />
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {/* Guide overlay box for farmer alignment */}
            <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[11px] font-semibold bg-emerald-950/80 text-emerald-200 px-2 py-0.5 rounded w-fit backdrop-blur-sm shadow-xs">
                Center diseased leaf / symptom here
              </span>
              <span className="text-[11px] font-semibold bg-emerald-950/80 text-emerald-200 px-2 py-0.5 rounded w-fit self-end backdrop-blur-sm shadow-xs">
                Tap round button to capture
              </span>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10 px-4">
              <button
                type="button"
                onClick={handleToggleFacing}
                className="bg-stone-900/80 hover:bg-stone-900 text-white p-3 rounded-full border border-stone-700 backdrop-blur-sm transition cursor-pointer active:scale-95"
                title="Switch Camera Front/Back"
              >
                <SwitchCamera className="w-5 h-5 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={handleCapturePhoto}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 border-4 border-white shadow-xl flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
                title="Capture Plant Photo"
              >
                <Camera className="w-7 h-7" />
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="bg-stone-900/80 hover:bg-stone-900 text-white p-3 rounded-full border border-stone-700 backdrop-blur-sm transition cursor-pointer active:scale-95"
                title="Close Camera"
              >
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>
          </div>
        )}

        {/* Empty Dropzone State */}
        {!selectedImage && !isCameraActive && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/60'
                : 'border-stone-300 bg-stone-50/50 hover:bg-stone-100/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Camera className="w-7 h-7" />
            </div>

            <h3 className="text-sm font-bold text-stone-800 mb-1">
              Take a Photo or Upload Crop Image
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mb-4">
              Capture or upload high-resolution leaf surfaces, spots, fungal growth, or pest infestation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Primary Native Shutter Button - Always works on all devices without WebRTC permission blocks */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                disabled={disabled}
                className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo with Camera</span>
              </button>

              {/* WebRTC Live Viewfinder */}
              <button
                type="button"
                onClick={() => startCamera()}
                disabled={disabled || isStartingCamera}
                className="bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-300 shadow-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Video className="w-4 h-4 text-emerald-700" />
                <span>Live Viewfinder</span>
              </button>

              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-300 shadow-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-stone-600" />
                <span>Browse Files</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-400 mt-3">
              Supports phone camera, gallery photos, JPEG, PNG, WebP up to 25MB
            </p>
          </div>
        )}

        {/* Hidden File Picker Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Hidden Native Camera Input with capture="environment" */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {cameraError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <span className="font-medium leading-relaxed">{cameraError}</span>
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition cursor-pointer"
              >
                Snap with Device Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-medium text-[11px] px-3 py-1 rounded-lg transition cursor-pointer"
              >
                Choose from Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Photography Tips */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold text-emerald-900">Field Advice for Accuracy:</span>
        </div>
        <div className="text-[11px] text-emerald-800 flex items-center flex-wrap gap-x-3 gap-y-1">
          <span>• Hold leaf steady in bright daylight</span>
          <span>• Include healthy &amp; diseased parts</span>
          <span>• Avoid heavy shadows</span>
        </div>
      </div>
    </div>
  );
};
