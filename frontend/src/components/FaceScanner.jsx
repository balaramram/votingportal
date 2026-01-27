import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { sounds } from '../utils/soundUtils';

const FaceScanner = ({ onFaceScanned }) => {
  const webcamRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState(null); // Timeout error kaatta

  // 1. Load AI Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Model loading failed:", err);
        setError("AI Models load aagala. Refresh panni paarunga.");
      }
    };
    loadModels();
  }, []);

  // 2. Scan Logic with 30s Timeout
  useEffect(() => {
    let interval;
    let timeout;

    if (isModelLoaded && isScanning) {
      sounds.playStart();
      // --- 30 Seconds Timeout Logic ---
      timeout = setTimeout(() => {
        setIsScanning(false);
        setError("Time out! Face not detected. Please adjust lighting and try again.");
        sounds.playError();
        clearInterval(interval);
      }, 15000); // 30 seconds

      interval = setInterval(async () => {
        if (webcamRef.current?.video?.readyState === 4) {
          const video = webcamRef.current.video;
          const detections = await faceapi.detectSingleFace(
            video, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

          if (detections) {
            clearTimeout(timeout); // Success aana timeout-ai stop pannanum
            setIsScanning(false);
            sounds.playSuccess();
            const faceDataString = JSON.stringify(Array.from(detections.descriptor));
            onFaceScanned(faceDataString);
            clearInterval(interval);
          }
        }
      }, 200); 
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isModelLoaded, isScanning, onFaceScanned]);

  return (
    <div className="flex flex-col items-center gap-6 bg-lightest p-8 rounded-4xl w-full max-w-xl border border-light/30 shadow-xl">
      {!isModelLoaded ? (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-dark rounded-full animate-ping"></div>
          <p className="text-dark font-bold text-lg">AI Models Loading...</p>
        </div>
      ) : (
        <>
          <div className="relative border-4 border-dark rounded-[2.5rem] overflow-hidden w-full aspect-square md:aspect-video shadow-2xl bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover grayscale-20"
            />
            
            {/* --- Scanning Overlay --- */}
            {isScanning && !error && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-full h-1.5 bg-linear-to-r from-transparent via-light to-transparent shadow-[0_0_20px_#C59DD9] top-0 animate-[scan_3s_linear_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-light/60 rounded-full animate-[pulse_2s_infinite]"></div>
                </div>
              </div>
            )}

            {/* --- Error / Timeout Overlay --- */}
            {error && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-20">
                <p className="text-red-400 font-bold mb-4">{error}</p>
                <button 
                  onClick={() => { setError(null); setIsScanning(true); }}
                  className="bg-light text-darkest px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Retry Scan
                </button>
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className={`text-xl font-black transition-colors ${error ? 'text-red-600' : isScanning ? 'text-darkest' : 'text-green-600'}`}>
              {error ? "Scan Failed" : isScanning ? "Scanning Identity..." : "Identity Verified ✅"}
            </h3>
            <p className="text-dark/70 text-sm">
              {error ? "Please ensure your face is clearly visible." : isScanning ? "Automatic biometric capture in progress (30s max)." : "Face data has been successfully captured."}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FaceScanner;