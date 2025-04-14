import mongoose from "mongoose";
import { boolean } from "zod";

const RiderSchema = new mongoose.Schema(
  {
    passportNumber: { type: String, required: true },
    personalNumber: { type: String, required: true },
    passportType: { type: String, required: true },
    surname: { type: String, required: true },
    givenName: { type: String, required: true },
    nationality: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    placeOfBirth: { type: String, required: true },
    issuingAuthority: { type: String },
    department: { type: String },
    diplomaticRank: { type: String, default: "" },
    mission: { type: String, default: "" },
    photo: { type: String },
    photoId: { type: String },
    signature: { type: String },
    signatureId: { type: String },
    userId: { type: String, required: true },
    isPrinted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Rider = mongoose.models?.Rider || mongoose.model("Rider", RiderSchema);

export default Rider;
