"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Passport } from "@/types/passportType";
import { dataURLtoBlob, generateCardFront } from "@/lib/help";
import { useUser } from "@clerk/nextjs";
import PhotoUpload from "../photo-upload";
import SignaturePad from "../signature-pad";

const formSchema = z.object({
  passportType: z
    .string()
    .min(2, "Passport Type is required")
    .max(2, "Passport Type is too long"),
  surname: z.string().min(1, "Surname is required"),
  givenName: z.string().min(1, "Given name is required"),
  birthDate: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  issuingAuthority: z.string().min(1, "Issuing authority is required"),
  // Conditional fields
  department: z.string().optional(),
  diplomaticRank: z.string().optional(),
  mission: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditpassportSheetProps {
  passport: Passport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedpassport: Passport) => void;
  isSubmitting: boolean;
}

export function EditpassportSheet({
  passport,
  open,
  onOpenChange,
  onSave,
  isSubmitting,
}: EditpassportSheetProps) {
  const { user } = useUser();

  const [imagePreview, setImagePreview] = useState<string | null>(
    passport?.photo || null
  );
  const [signatureUrl, setSignatureUrl] = useState<string | null>(
    passport?.signature || null
  );
  const [cardFront, setCardFront] = useState<any>("");
  const [imageReqError, setImageReqError] = useState<any>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passportType: passport?.passportType || "PC",
      surname: passport?.surname || "",
      givenName: passport?.givenName || "",
      birthDate: passport?.birthDate || "",
      gender: passport?.gender || "M",
      issueDate: passport?.issueDate || "",
      expiryDate: passport?.expiryDate || "",
      placeOfBirth: passport?.placeOfBirth || "",
      issuingAuthority: passport?.issuingAuthority || "",
      department: passport?.department || "",
      diplomaticRank: passport?.diplomaticRank || "",
      mission: passport?.mission || "",
    },
  });

  useEffect(() => {
    if (passport) {
      reset({
        passportType: passport.passportType || "PC",
        surname: passport.surname || "",
        givenName: passport.givenName || "",
        birthDate: passport.birthDate.slice(0, 10) || "",
        gender: passport.gender || "M",
        issueDate: passport.issueDate.slice(0, 10) || "",
        expiryDate: passport.expiryDate.slice(0, 10) || "",
        placeOfBirth: passport.placeOfBirth || "",
        issuingAuthority: passport.issuingAuthority || "",
        department: passport.department || "",
        diplomaticRank: passport.diplomaticRank || "",
        mission: passport.mission || "",
      });

      setImagePreview(passport.photo || null);
      setSignatureUrl(passport.signature || null);
    }
  }, [passport, reset]);

  const watchedFields = watch();
  const passportType = watch("passportType");

  const handlePhotoChange = (url: string) => {
    setImagePreview(url);
  };

  const handleSignatureChange = (url: string) => {
    setSignatureUrl(url);
  };

  const uploadToCloudinary = async (imageUrl: any) => {
    try {
      const blob: any = await dataURLtoBlob(imageUrl);
      const formData = new FormData();
      formData.append("file", blob);
      const response = await axios.post("/api/upload", formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (imagePreview) {
      setImageReqError("");
    } else {
      setImageReqError("Please upload a passport photo.");
    }
  }, [imagePreview]);

  const onSubmit = async (data: FormData) => {
    try {
      const newpassportData: any = {
        _id: passport._id,
        passportType: data.passportType,
        surname: data.surname,
        givenName: data.givenName,
        birthDate: data.birthDate,
        gender: data.gender,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        placeOfBirth: data.placeOfBirth,
        issuingAuthority: data.issuingAuthority,
        department: data.department,
        diplomaticRank: data.diplomaticRank,
        mission: data.mission,
        userId: user?.id,
      };

      if (imagePreview && imagePreview !== passport.photo) {
        const imageRes: any = await uploadToCloudinary(imagePreview);
        newpassportData.photo = imageRes?.url;
        newpassportData.photoId = imageRes?.publicId;
      }
      if (signatureUrl && signatureUrl !== passport.signature) {
        const signatureRes: any = await uploadToCloudinary(signatureUrl);
        newpassportData.signature = signatureRes?.url;
        newpassportData.signatureId = signatureRes?.publicId;
      }
      console.log("newpassportData", newpassportData);
      onSave(newpassportData);
    } catch (error) {
      console.log("Failed to update passport info:", error);
    }
  };

  const fetchCard = async () => {
    const front = await generateCardFront(passport);
    setCardFront(front);
  };

  useEffect(() => {
    if (Object.keys(passport).length > 0) {
      fetchCard();
    }
  }, [passport]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[50%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit passport Details</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-2xl mx-auto"
        >
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Passport Type */}
            <div className="space-y-2">
              <Label htmlFor="passportType">Passport Type</Label>
              <Select
                onValueChange={(value) =>
                  setValue("passportType", value as "PC" | "PS" | "PD")
                }
                defaultValue={watchedFields.passportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select passport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">PC - Regular</SelectItem>
                  <SelectItem value="PS">PS - Service</SelectItem>
                  <SelectItem value="PD">PD - Diplomatic</SelectItem>
                </SelectContent>
              </Select>
              {errors.passportType && (
                <p className="text-sm text-red-500">
                  {errors.passportType.message}
                </p>
              )}
            </div>

            {/* Surname */}
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" {...register("surname")} />
              {errors.surname && (
                <p className="text-sm text-red-500">{errors.surname.message}</p>
              )}
            </div>

            {/* Given Name */}
            <div className="space-y-2">
              <Label htmlFor="givenName">Given Name</Label>
              <Input id="givenName" {...register("givenName")} />
              {errors.givenName && (
                <p className="text-sm text-red-500">
                  {errors.givenName.message}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <Input type="date" id="birthDate" {...register("birthDate")} />
              {errors.birthDate && (
                <p className="text-sm text-red-500">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                onValueChange={(value) => setValue("gender", value)}
                defaultValue={watchedFields.gender}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input type="date" id="issueDate" {...register("issueDate")} />
              {errors.issueDate && (
                <p className="text-sm text-red-500">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input type="date" id="expiryDate" {...register("expiryDate")} />
              {errors.expiryDate && (
                <p className="text-sm text-red-500">
                  {errors.expiryDate.message}
                </p>
              )}
            </div>

            {/* Place of Birth */}
            <div className="space-y-2">
              <Label htmlFor="placeOfBirth">Place of Birth</Label>
              <Input id="placeOfBirth" {...register("placeOfBirth")} />
              {errors.placeOfBirth && (
                <p className="text-sm text-red-500">
                  {errors.placeOfBirth.message}
                </p>
              )}
            </div>

            {/* Issuing Authority */}
            <div className="space-y-2">
              <Label htmlFor="issuingAuthority">Issuing Authority</Label>
              <Input id="issuingAuthority" {...register("issuingAuthority")} />
              {errors.issuingAuthority && (
                <p className="text-sm text-red-500">
                  {errors.issuingAuthority.message}
                </p>
              )}
            </div>

            {/* Conditional fields based on passport type */}
            {passportType === "PD" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="diplomaticRank">Diplomatic Rank</Label>
                  <Input id="diplomaticRank" {...register("diplomaticRank")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission</Label>
                  <Input id="mission" {...register("mission")} />
                </div>
              </>
            )}

            {passportType === "PS" && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register("department")} />
              </div>
            )}

            {imageReqError && (
              <p className="text-sm text-red-500">{imageReqError}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload Component */}
              <PhotoUpload
                onPhotoChange={handlePhotoChange}
                initialPhoto={imagePreview!}
              />
              {/* Signature Pad Component */}

              <SignaturePad
                onSignatureChange={handleSignatureChange}
                initialSign={signatureUrl!}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-9" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Passport...
              </>
            ) : (
              "Update Passport"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
