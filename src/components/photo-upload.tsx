"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PhotoUploadProps {
  onPhotoChange: (photoUrl: string) => void;
  initialPhoto?: string;
}

export default function PhotoUpload({
  onPhotoChange,
  initialPhoto,
}: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      onPhotoChange(url);
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL
      const url = canvas.toDataURL("image/png");
      setPhotoUrl(url);
      onPhotoChange(url);

      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    }
  };

  const clearPhoto = () => {
    setPhotoUrl(null);
    onPhotoChange("/placeholder.svg?height=200&width=160");

    // If camera is active, stop it
    if (isCapturing && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">Passport Photo</Label>
      <div className="space-y-4">
        <div className="relative h-[200px] overflow-hidden border border-gray-300 bg-gray-100">
          {photoUrl ? (
            <>
              <img
                src={photoUrl || "/placeholder.svg"}
                alt="Passport Photo"
                className="w-full h-full object-cover"
              />
              <button
                onClick={clearPhoto}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : isCapturing ? (
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No photo
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex space-x-2">
          {isCapturing ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={capturePhoto}
              className="w-full"
            >
              Capture
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
