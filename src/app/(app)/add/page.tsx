"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Loader2, Upload } from "lucide-react";

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
import PhotoUpload from "@/components/photo-upload";
import SignaturePad from "@/components/signature-pad";

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

export default function AddRiderForm() {
  const { user } = useUser();
  const { addRider } = useRiderContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newRiderinfo, setNewRiderinfo] = useState<any>({});
  const [cardFront, setCardFront] = useState<any>("");
  const [imageReqError, setImageReqError] = useState<any>("");

  const [photoUrl, setPhotoUrl] = useState(
    "/placeholder.svg?height=200&width=160"
  );
  const [signatureUrl, setSignatureUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "REPUBLIC OF THE GAMBIA",
      passportType: "PC",
      surname: "Touray",
      givenName: "Ebrima",
      nationality: "GAMBIAN",
      birthDate: "2005-04-09",
      gender: "M",
      issueDate: "2025-04-09",
      expiryDate: "2030-04-09",
      placeOfBirth: "BANJUL",
      issuingAuthority: "BANJUL",
      department: "IMMIGRATION DEPARTMENT",
      diplomaticRank: "",
      mission: "",
    },
  });

  const watchedFields = watch();
  const passportType = watch("passportType");

  const handlePhotoChange = (url: string) => {
    setPhotoUrl(url);
    setImagePreview(url);
  };

  const handleSignatureChange = (url: string) => {
    setSignatureUrl(url);
  };

  const uploadToCloudinary = async () => {
    const PhotoBlob = await dataURLtoBlob(imagePreview!);
    const SignBlob = await dataURLtoBlob(signatureUrl);
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
    setNewRiderinfo({
      passportType: watchedFields.passportType,
      passportNumber: "PC000000",
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
      signature: signatureUrl,
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
    signatureUrl,
    imagePreview,
  ]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Upload photo and signature to server
      let photoData, signatureData;

      if (
        imagePreview &&
        imagePreview !== "/placeholder.svg?height=200&width=160"
      ) {
        const { imageData }: any = await uploadToCloudinary();
        photoData = imageData;
      } else {
        setImageReqError("Passport photo is required");
        setIsSubmitting(false);
        return;
      }

      if (signatureUrl) {
        const { signData }: any = await uploadToCloudinary();
        signatureData = signData;
      } else {
        setImageReqError("Holder Signature is required");
        setIsSubmitting(false);
        return;
      }

      const newRiderData: any = {
        passportType: data.passportType,
        surname: data.surname,
        givenName: data.givenName,
        nationality: "GAMBIAN",
        birthDate: data.birthDate,
        gender: data.gender,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        placeOfBirth: data.placeOfBirth,
        issuingAuthority: data.issuingAuthority,
        department: data.department,
        diplomaticRank: data.diplomaticRank,
        mission: data.mission,
        photo: photoData.url,
        photoId: photoData.publicId,
        signature: signatureData?.url || null,
        signatureId: signatureData?.publicId || null,
        userId: user?.id,
      };

      console.log(newRiderData);

      await addRider(newRiderData);
      setIsSubmitting(false);
      reset();
      setImagePreview(null);
      setPhotoUrl("/placeholder.svg?height=200&width=160");
      setSignatureUrl("");
      setCardFront("");

      toast({
        title: "Success",
        description: "Passport added successfully",
      });
    } catch (error) {
      console.log("Failed to add rider info:", error);
      toast({
        title: "Error",
        description: "Failed to add passport information",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const fetchCard = async () => {
    const front = await generateCardFront(newRiderinfo);
    setCardFront(front);
  };

  useEffect(() => {
    fetchCard();
  }, [newRiderinfo]);

  return (
    <div className="flex h-[calc(100vh-70px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 pb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Add New Passport
          </h2>

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
                <SelectTrigger className="py-6">
                  <SelectValue placeholder="Select passport type" />
                </SelectTrigger>
                <SelectContent className="py-6">
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
              <Input
                className="py-6"
                placeholder="Surname eg. Turay, Jallow"
                id="surname"
                {...register("surname")}
              />
              {errors.surname && (
                <p className="text-sm text-red-500">{errors.surname.message}</p>
              )}
            </div>

            {/* Given Name */}
            <div className="space-y-2">
              <Label htmlFor="givenName">Given Name</Label>
              <Input
                className="py-6"
                placeholder="given name eg. Ebrima, Mariama Binta"
                id="givenName"
                {...register("givenName")}
              />
              {errors.givenName && (
                <p className="text-sm text-red-500">
                  {errors.givenName.message}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <Input
                className="py-6"
                placeholder="Date of Birth"
                type="date"
                id="birthDate"
                {...register("birthDate")}
              />
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
              <Input
                className="py-6"
                type="date"
                id="issueDate"
                {...register("issueDate")}
              />
              {errors.issueDate && (
                <p className="text-sm text-red-500">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                className="py-6"
                type="date"
                id="expiryDate"
                {...register("expiryDate")}
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
              <Input
                className="py-6"
                placeholder="Place of birth eg. Banjul"
                id="placeOfBirth"
                {...register("placeOfBirth")}
              />
              {errors.placeOfBirth && (
                <p className="text-sm text-red-500">
                  {errors.placeOfBirth.message}
                </p>
              )}
            </div>

            {/* Issuing Authority */}
            <div className="space-y-2">
              <Label htmlFor="issuingAuthority">Issuing Authority</Label>
              <Input
                className="py-6"
                placeholder="Issuing Authority"
                id="issuingAuthority"
                {...register("issuingAuthority")}
              />
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
                  <Input
                    className="py-6"
                    placeholder="Diplomatic Rank"
                    id="diplomaticRank"
                    {...register("diplomaticRank")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission</Label>
                  <Input
                    className="py-6"
                    placeholder="Mission"
                    id="mission"
                    {...register("mission")}
                  />
                </div>
              </>
            )}

            {passportType === "PS" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  className="py-6"
                  placeholder="Department"
                  id="department"
                  {...register("department")}
                />
              </div>
            )}

            {/* <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo</Label>
                {imageReqError && (
                  <p className="text-sm text-red-500">{imageReqError}</p>
                )}
                <div className="w-32 p-2 h-32 bg-accent rounded-sm relative flex flex-col items-center justify-center">
                  <Upload />
                  <span className="text-xs text-center">
                    Click or Drag and Drop
                  </span>
                  <Input
                    className="absolute top-0 bottom-0 left-0 right-0 z-10 opacity-0 cursor-pointer h-full w-full"
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {imagePreview && (
                    <div className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-background">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div> */}

            {/* Photo Upload and Signature Components */}
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
              <SignaturePad onSignatureChange={handleSignatureChange} />
            </div>
          </div>

          <Button type="submit" className="w-full mt-9" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Passport...
              </>
            ) : (
              "Add Passport"
            )}
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {newRiderinfo && (
          <div className="space-y-6">
            <div className="h-full gap-4 w-full relative ">
              <img
                height={1476}
                width={1040}
                className="w-full object-fill rounded-md shadow-lg"
                src={cardFront ? cardFront : "/loader.png"}
                alt=""
              />
            </div>

            {/* passport Details */}
            <div className="w-full rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Passport Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{newRiderinfo.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passport Type</p>
                  <p className="font-medium">{newRiderinfo.passportType}</p>
                </div>
                {newRiderinfo.passportType === "PD" && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Diplomatic Rank</p>
                      <p className="font-medium">
                        {newRiderinfo.diplomaticRank}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mission</p>
                      <p className="font-medium">{newRiderinfo.mission}</p>
                    </div>
                  </>
                )}

                {newRiderinfo.passportType === "PS" && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{newRiderinfo.department}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Passport Number</p>
                  <p className="font-medium">{newRiderinfo.passportNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {`${newRiderinfo.givenName} ${
                      newRiderinfo.middleName || ""
                    } ${newRiderinfo.surname}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium">{newRiderinfo.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{newRiderinfo.birthDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{newRiderinfo.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Place of Birth</p>
                  <p className="font-medium">{newRiderinfo.placeOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issuing Authority</p>
                  <p className="font-medium">{newRiderinfo.issuingAuthority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{newRiderinfo.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium">{newRiderinfo.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{newRiderinfo.expiryDate}</p>
                </div>
                {newRiderinfo.diplomaticRank && (
                  <div>
                    <p className="text-sm text-gray-500">Diplomatic Rank</p>
                    <p className="font-medium">{newRiderinfo.diplomaticRank}</p>
                  </div>
                )}
                {newRiderinfo.mission && (
                  <div>
                    <p className="text-sm text-gray-500">Mission</p>
                    <p className="font-medium">{newRiderinfo.mission}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
