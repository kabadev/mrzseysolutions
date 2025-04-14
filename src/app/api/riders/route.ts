import { riders } from "@/constants/menu";
import { mongooseConnect } from "@/lib/mongoose";
import {
  generateNextId,
  generateNextPassportNumber,
  generateNextPersonalNumber,
} from "@/lib/utils";
import Rider from "@/models/Rider";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    mongooseConnect();
    const {
      passportType,
      surname,
      givenName,
      nationality,
      birthDate,
      gender,
      issueDate,
      expiryDate,
      placeOfBirth,
      issuingAuthority,
      department,
      diplomaticRank,
      mission,
      photo,
      photoId,
      signature,
      signatureId,
      userId,
    } = await request.json();

    const client = await clerkClient();
    const passportNumber = await generateNextPassportNumber(passportType);
    const personalNumber = await generateNextPersonalNumber();
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found." });
    }
    const newRider = new Rider({
      passportNumber,
      personalNumber,
      passportType,
      surname,
      givenName,
      nationality,
      birthDate,
      gender,
      issueDate,
      expiryDate,
      placeOfBirth,
      issuingAuthority,
      department,
      diplomaticRank,
      mission,
      photo,
      photoId,
      signature,
      signatureId,
      userId,
    });
    await newRider.save();

    const riders = await Rider.find().sort({ createdAt: -1 }).limit(200);
    return NextResponse.json({ message: "User created", riders });
  } catch (error) {
    console.log("server error:", error);
    return NextResponse.json({ error: "Error creating user" });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "200");
  const search = searchParams.get("search") || "";
  // Determine the value of isPrinted
  const isPrintedParam = searchParams.get("isPrinted");

  const isPrinted =
    isPrintedParam === "true"
      ? true
      : isPrintedParam === "false"
      ? false
      : undefined;

  const skip = (page - 1) * limit;

  try {
    mongooseConnect();
    const query = search
      ? {
          $or: [
            { passportNumber: { $regex: search, $options: "i" } },
            { surname: { $regex: search, $options: "i" } },
            { givenName: { $regex: search, $options: "i" } },
            { personalNumber: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const getquery: any = {};
    if (isPrinted !== undefined) {
      getquery.isPrinted = isPrinted;
    }
    // const riders = await Rider.find(getquery)
    const riders = await Rider.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Rider.countDocuments(query);

    return NextResponse.json({
      riders,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    mongooseConnect();
    const {
      id,
      passportType,
      surname,
      givenName,
      nationality,
      birthDate,
      gender,
      issueDate,
      expiryDate,
      placeOfBirth,
      issuingAuthority,
      department,
      diplomaticRank,
      mission,
      userId,
      photo,
      photoId,
      signature,
      signatureId,
    } = await request.json();

    const rider = await Rider.findById(id);

    if (!rider) {
      return NextResponse.json({ error: "User not found" });
    }

    const data = {
      passportType,
      surname,
      givenName,
      nationality,
      birthDate,
      gender,
      issueDate,
      expiryDate,
      placeOfBirth,
      issuingAuthority,
      department,
      diplomaticRank,
      mission,
      userId,
      photo,
      photoId,
      signature,
      signatureId,
    };
    await Rider.findByIdAndUpdate(rider._id, data, {
      new: true,
    });
    if (photo && photo !== rider.photo) {
      await cloudinary.uploader.destroy(rider.photoId);
    }
    if (signature && signature !== rider.signature) {
      await cloudinary.uploader.destroy(rider.signatureId);
    }

    return NextResponse.json({ message: "Passport updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error updating Passport" });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    mongooseConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    const rider = await Rider.findById(id);
    await Rider.findByIdAndDelete(rider._id);
    await cloudinary.uploader.destroy(rider.photoId);
    return NextResponse.json({ message: "Passport  deleted" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error Deleteing user" });
  }
}
