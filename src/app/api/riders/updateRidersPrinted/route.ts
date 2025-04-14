import { mongooseConnect } from "@/lib/mongoose";
import Rider from "@/models/Rider";
import { NextRequest, NextResponse } from "next/server";

import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: NextRequest) {
  try {
    mongooseConnect();
    const { riderIds } = await req.json();

    if (!Array.isArray(riderIds) || riderIds.length === 0) {
      return NextResponse.json({ error: "Invalid rider IDs" }, { status: 400 });
    }

    const result = await Rider.updateMany(
      { _id: { $in: riderIds } },
      { $set: { isPrinted: true } }
    );

    return NextResponse.json({
      message: "Selected riders updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating riders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    mongooseConnect();
    const { id, photo, photoId } = await request.json();
    const rider = await Rider.findById(id);
    if (!rider) {
      return NextResponse.json(
        { error: "Passport  not found" },
        { status: 404 }
      );
    }
    const data = {
      photo,
      photoId,
    };
    await Rider.findByIdAndUpdate(rider._id, data, {
      new: true,
    });
    if (photo !== rider.photo) {
      await cloudinary.uploader.destroy(rider.photoId);
    }

    return NextResponse.json({ message: "Passport updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error updating rider" });
  }
}
