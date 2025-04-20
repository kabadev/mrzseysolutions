"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ImageIcon, Download, Printer } from "lucide-react";
import Image from "next/image";
import { Passport } from "@/types/passportType";
import { useEffect, useState } from "react";
import {
  generateCardFront,
  printSingleIDCard,
  saveSingleIDCard,
} from "@/lib/help";

interface PassportDetailSheetProps {
  passport: Passport;
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onEditPhoto: () => void;
  onDelete: () => void;
}

export function PassportDetailSheet({
  passport,
  open,
  isLoading,
  onOpenChange,
  onEdit,
  onEditPhoto,
  onDelete,
}: PassportDetailSheetProps) {
  // Format date to a more readable format
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const [issaving, setIssaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoEdit, setIsPhotoEdit] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [cardFront, setCardFront] = useState<any>("");

  const fetchCard = async () => {
    const front: any = await generateCardFront(passport);
    setCardFront(front);
  };

  useEffect(() => {
    fetchCard();
  }, [passport, generateCardFront]);

  const handleSaveSingle = async () => {
    setIssaving(true);

    const frontImage: any = await generateCardFront(passport);

    await saveSingleIDCard(
      frontImage,
      `${passport.givenName}-${passport.passportNumber}`
    );

    if (!passport.isPrinted) {
      try {
        // await updatePrintedRiders([rider]);
        setIssaving(false);
        // router.refresh();
      } catch (error) {
        setIssaving(false);
        console.log(error);
      }
    }

    setIssaving(false);
  };

  const handlePrintSingle = async () => {
    setIsPrinting(true);

    const frontImage: any = await generateCardFront(passport);
    await printSingleIDCard(frontImage);
    if (passport.isPrinted === false) {
      try {
        // await updatePrintedRiders([rider]);
        //   router.refresh();
        setIsPrinting(false);
      } catch (error) {
        setIsPrinting(false);
        console.log(error);
      }
    }
    setIsPrinting(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[50%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Passport Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-center gap-4 w-full relative ">
              <Image
                height={500}
                width={300}
                className="w-[80%]"
                src={cardFront ? cardFront : "/loader.png"}
                alt=""
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <div className="space-x-2">
              <Button onClick={handleSaveSingle} disabled={issaving}>
                <Download className="mr-2 h-4 w-4" />
                {issaving ? "Downloading.." : " Download"}
              </Button>

              <Button onClick={handlePrintSingle} disabled={isPrinting}>
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? "Printing.." : " Print"}
              </Button>
            </div>

            <Button onClick={onEdit} className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button onClick={onEditPhoto} variant="outline" className="flex-1">
              <ImageIcon className="mr-2 h-4 w-4" />
              Edit Photo
            </Button>
            <Button onClick={onDelete} variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Passport Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Passport Number"
                value={passport.passportNumber}
              />
              <DetailItem
                label="Personal Number"
                value={passport.personalNumber}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Nationality" value={passport.nationality} />
              <DetailItem
                label="Gender"
                value={passport.gender === "M" ? "Male" : "Female"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Date of Birth"
                value={formatDate(passport.birthDate)}
              />
              <DetailItem
                label="Place of Birth"
                value={passport.placeOfBirth}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Issue Date"
                value={formatDate(passport.issueDate)}
              />
              <DetailItem
                label="Expiry Date"
                value={formatDate(passport.expiryDate)}
              />
            </div>

            <DetailItem
              label="Issuing Authority"
              value={passport.issuingAuthority}
            />
            <DetailItem label="Department" value={passport.department} />

            {passport.diplomaticRank && (
              <DetailItem
                label="Diplomatic Rank"
                value={passport.diplomaticRank}
              />
            )}

            {passport.mission && (
              <DetailItem label="Mission" value={passport.mission} />
            )}
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Signature</h3>
            <div className="h-20 w-full bg-gray-50 border rounded-md flex items-center justify-center overflow-hidden">
              <Image
                src={passport.signature || "/placeholder.svg"}
                alt="Signature"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "-"}</p>
    </div>
  );
}
