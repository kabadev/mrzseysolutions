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

import { toast } from "@/hooks/use-toast";
import { useRiderContext } from "@/context/riderContext";
import { dataURLtoBlob, generateCardFront } from "@/lib/help";
import { useUser } from "@clerk/nextjs";
import PhotoUpload from "../photo-upload";
import SignaturePad from "../signature-pad";

const formSchema = z.object({
  country: z.string().min(1, "Country is required"),
  passportType: z.enum(["PC", "PS", "PD"], {
    required_error: "Passport type is required",
  }),
  surname: z.string().min(1, "Surname is required"),
  givenName: z.string().min(1, "Given name is required"),
  nationality: z.string().min(1, "Nationality is required"),
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

export default function EditRiderForm({
  rider,
  onCloseForm,
  setSelectedRider,
}: {
  rider: any;
  onCloseForm: any;
  setSelectedRider: React.Dispatch<React.SetStateAction<any>>;
}) {
  const { user } = useUser();
  const { updateRider } = useRiderContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    rider?.photo || null
  );
  const [signatureUrl, setSignatureUrl] = useState<string | null>(
    rider?.signature || null
  );
  const [cardFront, setCardFront] = useState<any>("");
  const [imageReqError, setImageReqError] = useState<any>("");
  const [riderInfo, setRiderInfo] = useState<any>(rider || {});

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
      country: rider?.country || "REPUBLIC OF THE GAMBIA",
      passportType: rider?.passportType || "PC",
      surname: rider?.surname || "",
      givenName: rider?.givenName || "",
      nationality: rider?.nationality || "GAMBIAN",
      birthDate: rider?.birthDate || "",
      gender: rider?.gender || "M",
      issueDate: rider?.issueDate || "",
      expiryDate: rider?.expiryDate || "",
      placeOfBirth: rider?.placeOfBirth || "",
      issuingAuthority: rider?.issuingAuthority || "",
      department: rider?.department || "",
      diplomaticRank: rider?.diplomaticRank || "",
      mission: rider?.mission || "",
    },
  });

  const watchedFields = watch();
  const passportType = watch("passportType");

  const handlePhotoChange = (url: string) => {
    setImagePreview(url);
  };

  const handleSignatureChange = (url: string) => {
    setSignatureUrl(url);
  };

  const uploadToCloudinary = async () => {
    const PhotoBlob = await dataURLtoBlob(imagePreview!);
    const SignBlob = await dataURLtoBlob(signatureUrl!);
    const PhotoFormData = new FormData();
    const formData = new FormData();
    PhotoFormData.append("file", PhotoBlob);
    formData.append("file", SignBlob);

    try {
      const PhotoResponse = await axios.post("/api/upload", PhotoFormData);
      const SignaTureresponse = await axios.post("/api/upload", formData);
      const imageData = PhotoResponse.data;
      const signData = SignaTureresponse.data;
      return { imageData, signData };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    }
  };

  useEffect(() => {
    setRiderInfo({
      passportType: watchedFields.passportType,
      passportNumber: rider?.passportNumber || "PC000000",
      surname: watchedFields.surname,
      givenName: watchedFields.givenName,
      nationality: "GAMBIAN",
      birthDate: watchedFields.birthDate,
      gender: watchedFields.gender,
      issueDate: watchedFields.issueDate,
      expiryDate: watchedFields.expiryDate,
      placeOfBirth: watchedFields.placeOfBirth,
      issuingAuthority: watchedFields.issuingAuthority,
      department: watchedFields.department,
      diplomaticRank: watchedFields.diplomaticRank,
      mission: watchedFields.mission,
      photo: imagePreview,
      signature: rider?.signature,
    });
  }, [
    watchedFields.surname,
    watchedFields.givenName,
    watchedFields.gender,
    watchedFields.passportType,
    watchedFields.birthDate,
    watchedFields.gender,
    watchedFields.issueDate,
    watchedFields.expiryDate,
    watchedFields.placeOfBirth,
    watchedFields.issuingAuthority,
    watchedFields.department,
    watchedFields.diplomaticRank,
    watchedFields.mission,
    imagePreview,
  ]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      let photoData, signatureData;

      const newRiderData: any = {
        id: rider._id,
        passportType: data.passportType,
        surname: data.surname,
        givenName: data.givenName,
        nationality: data.nationality,
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

      if (imagePreview && rider.photo !== imagePreview) {
        const { imageData }: any = await uploadToCloudinary();
        photoData = imageData;
        newRiderData.photo = photoData.url;
        newRiderData.photoId = photoData.publicId;
      }
      if (signatureUrl && rider.signature !== signatureUrl) {
        const { signData }: any = await uploadToCloudinary();
        signatureData = signData;
        newRiderData.signature = signData.url;
        newRiderData.signatureId = signData.publicId;
      }

      await updateRider(newRiderData);
      setIsSubmitting(false);
      setSelectedRider(newRiderData);
      onCloseForm();

      window.location.reload();
    } catch (error) {
      console.log("Failed to update passport info:", error);
      setIsSubmitting(false);
    }
  };

  const fetchCard = async () => {
    const front = await generateCardFront(riderInfo);
    setCardFront(front);
  };

  useEffect(() => {
    if (Object.keys(riderInfo).length > 0) {
      fetchCard();
    }
  }, [riderInfo]);

  return (
    <div className="overflow-y-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-center">
            Edit Passport Details
          </h2>
          <Button onClick={onCloseForm} variant={"ghost"}>
            <X />
          </Button>
        </div>

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
              <p className="text-sm text-red-500">{errors.givenName.message}</p>
            )}
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">Date of Birth</Label>
            <Input
              type="date"
              id="birthDate"
              {...register("birthDate")}
              value={watchedFields.birthDate.slice(0, 10)}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate.message}</p>
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
            <Input
              type="date"
              id="issueDate"
              {...register("issueDate")}
              value={watchedFields.issueDate.slice(0, 10)}
            />
            {errors.issueDate && (
              <p className="text-sm text-red-500">{errors.issueDate.message}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              type="date"
              id="expiryDate"
              {...register("expiryDate")}
              value={watchedFields.expiryDate.slice(0, 10)}
            />
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
    </div>
  );
}
