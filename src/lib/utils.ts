import Rider from "@/models/Rider";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { mongooseConnect } from "./mongoose";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateNextId = async (): Promise<string> => {
  mongooseConnect();
  const latestItem = await Rider.findOne().sort({ id: -1 }).exec();
  const prefix = "BRU24";

  if (!latestItem) {
    return `${prefix}000001`;
  }

  const currentId = latestItem.id;
  const numberPart = currentId.slice(prefix.length);
  const incrementedNumber = parseInt(numberPart, 10) + 1;

  if (incrementedNumber > 500000) {
    throw new Error("Maximum ID limit reached");
  }

  const newNumberPart = incrementedNumber
    .toString()
    .padStart(numberPart.length, "0");
  return `${prefix}${newNumberPart}`;
};
export const generateNextPassportNumber = async (
  passportType: "PC" | "PD" | "PS"
): Promise<string> => {
  await mongooseConnect();

  const prefix = passportType;

  // Find the latest passport of the given type
  const latestItem = await Rider.findOne({
    passportNumber: { $regex: `^${prefix}` },
  })
    .sort({ passportNumber: -1 })
    .exec();

  if (!latestItem) {
    return `${prefix}00000001`;
  }

  const currentId = latestItem.passportNumber;
  const numberPart = currentId.slice(prefix.length);
  const incrementedNumber = parseInt(numberPart, 10) + 1;

  const newNumberPart = incrementedNumber
    .toString()
    .padStart(numberPart.length, "0");

  return `${prefix}${newNumberPart}`;
};

export const generateNextPersonalNumber = async (): Promise<string> => {
  await mongooseConnect();

  // Find the latest personal number
  const latestItem = await Rider.findOne({
    personalNumber: { $regex: /^[0-9]+$/ },
  })
    .sort({ personalNumber: -1 })
    .exec();

  if (!latestItem) {
    return "000001";
  }

  const currentNumber = latestItem.personalNumber;

  const incremented = parseInt(currentNumber, 10) + 1;

  return incremented.toString().padStart(currentNumber.length, "0");
};

export function extractIds(riders: any) {
  return riders.map((rider: any) => rider._id);
}

function pad(str: string, length: number, char = "<"): string {
  return (str + char.repeat(length)).substring(0, length);
}

function formatDate(date: string): string {
  // Expects YYYY-MM-DD, returns YYMMDD
  return date.replace(/-/g, "").slice(2, 8);
}

function computeCheckDigit(input: string): string {
  const weights = [7, 3, 1];
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<";
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const value = chars.indexOf(char);
    const weight = weights[i % 3];
    sum += value * weight;
  }

  return (sum % 10).toString();
}

type MRZInput = {
  passportType: string;
  issuingCountry: string;
  givenName: string;
  surname: string;
  passportNumber: string;
  nationality: string;
  birthDate: string;
  sex: "M" | "F" | "<";
  expiryDate: string;
  personalNumber: string;
};

export function generateMRZ(data: MRZInput) {
  const nameField = pad(
    `${data?.surname?.toUpperCase()}<<${data?.givenName
      ?.toUpperCase()
      .replace(/ /g, "<")}`,
    39
  );

  const passportNumber = pad(data?.passportNumber?.toUpperCase(), 9);
  const passportCheckDigit = computeCheckDigit(passportNumber);

  const birthDate = formatDate(data?.birthDate);
  const birthCheckDigit = computeCheckDigit(birthDate);

  const expiryDate = formatDate(data?.expiryDate);
  const expiryCheckDigit = computeCheckDigit(expiryDate);

  const personalNumber = pad(data?.personalNumber?.toUpperCase(), 14);
  const personalCheckDigit = computeCheckDigit(personalNumber);

  const compositeCheckDigit = computeCheckDigit(
    passportCheckDigit +
      birthDate +
      birthCheckDigit +
      expiryDate +
      expiryCheckDigit +
      personalNumber +
      personalCheckDigit
  );

  const line1 = `${pad(data.passportType, 2)}${pad("GMB", 3)}${nameField}`;
  const line2 = `${passportNumber}${passportCheckDigit}${pad(
    data.nationality,
    3
  )}${birthDate}${birthCheckDigit}${
    data.sex
  }${expiryDate}${expiryCheckDigit}${personalNumber}${personalCheckDigit}${compositeCheckDigit}`;

  return { line1, line2 };
}

// passsport
