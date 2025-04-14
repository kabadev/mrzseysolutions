"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Edit } from "lucide-react";

interface SignatureUploadProps {
  onSignatureChange: (signatureUrl: string) => void;
}

export function SignatureUpload({ onSignatureChange }: SignatureUploadProps) {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSignatureUrl(url);
      onSignatureChange(url);
    }
  };

  const startDrawing = () => {
    setIsDrawing(true);
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.lineCap = "round";
        context.lineJoin = "round";
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawingActive(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setLastPos({ x, y });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawingActive(true);
    const canvas = canvasRef.current;
    if (canvas && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      setLastPos({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const context = canvas.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(x, y);
        context.stroke();
      }

      setLastPos({ x, y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingActive) return;

    const canvas = canvasRef.current;
    if (canvas && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      const context = canvas.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(x, y);
        context.stroke();
      }

      setLastPos({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDrawingActive(false);
  };

  const handleTouchEnd = () => {
    setIsDrawingActive(false);
  };

  const saveSignature = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setSignatureUrl(dataUrl);
      onSignatureChange(dataUrl);
      setIsDrawing(false);
    }
  };

  const clearSignature = () => {
    if (canvasRef.current && isDrawing) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      setSignatureUrl(null);
      onSignatureChange("SIGNATURE");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative h-16 w-full overflow-hidden border border-gray-300 bg-gray-100 rounded-md">
        {isDrawing ? (
          <canvas
            ref={canvasRef}
            width={300}
            height={64}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : signatureUrl ? (
          <>
            <img
              src={signatureUrl || "/placeholder.svg"}
              alt="Signature"
              className="w-full h-full object-contain"
            />
            <button
              onClick={clearSignature}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No signature
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {isDrawing ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={saveSignature}
              className="flex-1"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="flex-1"
            >
              Clear
            </Button>
          </>
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
              onClick={startDrawing}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Draw
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
  );
}
