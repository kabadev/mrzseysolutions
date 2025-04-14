"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resizeImage } from "@/lib/help";
import axios from "axios";

interface SignaturePadProps {
  onSignatureChange: (url: string) => void;
  initialSign?: string;
}

export default function SignaturePad({
  onSignatureChange,
  initialSign,
}: SignaturePadProps) {
  const [signatureUrl, setSignatureUrl] = useState(initialSign || "");
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureInputMethod, setSignatureInputMethod] = useState<
    "upload" | "draw"
  >("draw");
  const signaturePadRef = useRef<HTMLCanvasElement>(null);

  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resizedImage = await resizeImage(file, 300, 80);
      setSignatureUrl(resizedImage);
      onSignatureChange(resizedImage);
    } catch (error) {
      console.error("Error resizing signature:", error);
    }
  };

  const initSignaturePad = useCallback(() => {
    const canvas = signaturePadRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#000000";

    // ✨ Clear canvas (no background fill)
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = signaturePadRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      setIsDrawing(true);

      let clientX, clientY;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      context.beginPath();
      context.moveTo(x, y);
    },
    []
  );

  const draw = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawing) return;

      const canvas = signaturePadRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      let clientX, clientY;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      context.lineTo(x, y);
      context.stroke();
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    const canvas = signaturePadRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.closePath();
    setIsDrawing(false);

    const signatureImage = canvas.toDataURL("image/png");
    setSignatureUrl(signatureImage);
    onSignatureChange(signatureImage);
  }, [isDrawing, onSignatureChange]);

  const clearSignature = useCallback(() => {
    const canvas = signaturePadRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // ✨ Clear instead of filling with white
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureUrl("");
    onSignatureChange("");
  }, [onSignatureChange]);

  useEffect(() => {
    if (signatureInputMethod === "upload") {
      initSignaturePad();
    }
  }, [initSignaturePad, signatureInputMethod]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="signature">Signature</Label>
        {signatureUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            className="flex items-center gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <Tabs
        value={signatureInputMethod}
        onValueChange={(value) =>
          setSignatureInputMethod(value as "upload" | "draw")
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="draw" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m7 8 3 3" />
              <path d="m14 8-3 3" />
              <path d="M8 14h8" />
            </svg>
            Draw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          <div className="w-full h-32 bg-accent rounded-sm relative flex flex-col items-center justify-center border">
            <Upload className="h-6 w-6" />
            <span className="text-xs text-center mt-1">Upload Signature</span>
            <Input
              className="absolute top-0 bottom-0 left-0 right-0 z-10 opacity-0 cursor-pointer h-full w-full"
              id="signature-upload"
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
            />
            {signatureUrl && signatureInputMethod === "upload" && (
              <div className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-background flex items-center justify-center">
                <img
                  src={signatureUrl || "/placeholder.svg"}
                  alt="Signature"
                  className="max-h-full max-w-full object-contain p-2"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="draw" className="mt-2">
          <div className="border rounded-md bg-transparent">
            <canvas
              ref={signaturePadRef}
              className="w-full h-32 touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Sign using your mouse or finger in the area above
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
