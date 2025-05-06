"use server";

import Rider from "@/models/Rider";
import { mongooseConnect } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

interface FetchPassportsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string | null;
  sortDirection?: "asc" | "desc";
  issueDateStart?: Date | null;
  issueDateEnd?: Date | null;
  printedStatus?: string | null;
}

export async function fetchPassports({
  page = 1,
  limit = 10,
  search = "",
  sortField = null,
  sortDirection = "asc",
  issueDateStart = null,
  issueDateEnd = null,
  printedStatus = null,
}: FetchPassportsParams) {
  try {
    mongooseConnect();
    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { passportNumber: { $regex: search, $options: "i" } },
        { personalNumber: { $regex: search, $options: "i" } },
        { givenName: { $regex: search, $options: "i" } },
        { surname: { $regex: search, $options: "i" } },
      ];
    }

    // Issue date filter
    if (issueDateStart || issueDateEnd) {
      query.issueDate = {};
      if (issueDateStart) {
        query.issueDate.$gte = issueDateStart;
      }
      if (issueDateEnd) {
        query.issueDate.$lte = issueDateEnd;
      }
    }

    // Printed status filter
    if (printedStatus) {
      query.isPrinted = printedStatus === "printed";
    }

    // Build sort
    let sort: any = {};
    if (sortField) {
      sort[sortField] = sortDirection === "asc" ? 1 : -1;
    } else {
      sort = { createdAt: -1 }; // Default sort by creation date, newest first
    }

    // Count total documents for pagination
    const total = await Rider.countDocuments(query);

    // Fetch paginated results
    const passports = await Rider.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return JSON.parse(
      JSON.stringify({
        passports,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching passports:", error);
    throw new Error("Failed to fetch passports");
  }
}

export async function getPassportById(id: string) {
  try {
    mongooseConnect();
    const passport = await Rider.findById(id).lean();

    if (!passport) {
      throw new Error("Passport not found");
    }

    return JSON.parse(JSON.stringify(passport));
  } catch (error) {
    console.error("Error fetching passport:", error);
    throw new Error("Failed to fetch passport");
  }
}

export async function createPassport(data: any) {
  try {
    mongooseConnect();
    const newPassport = new Rider(data);
    await newPassport.save();

    revalidatePath("/"); // Revalidate the main page to show the new passport
    return JSON.parse(JSON.stringify(newPassport));
  } catch (error) {
    console.error("Error creating passport:", error);
    throw new Error("Failed to create passport");
  }
}

export async function updatePassport(id: string, data: any) {
  try {
    mongooseConnect();
    const updatedPassport = await Rider.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPassport) {
      throw new Error("Passport not found");
    }

    revalidatePath("/"); // Revalidate the main page
    return JSON.parse(JSON.stringify(updatedPassport));
  } catch (error) {
    console.error("Error updating passport:", error);
    throw new Error("Failed to update passport");
  }
}

export async function deletePassport(id: string) {
  try {
    mongooseConnect();
    const deletedPassport = await Rider.findByIdAndDelete(id).lean();

    if (!deletedPassport) {
      throw new Error("Passport not found");
    }

    revalidatePath("/"); // Revalidate the main page
    return { success: true };
  } catch (error) {
    console.error("Error deleting passport:", error);
    throw new Error("Failed to delete passport");
  }
}

export async function updatePassportPhoto(
  id: string,
  photo: string,
  photoId: string
) {
  try {
    mongooseConnect();
    const updatedPassport = await Rider.findByIdAndUpdate(
      id,
      { $set: { photo, photoId } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPassport) {
      throw new Error("Passport not found");
    }

    revalidatePath("/"); // Revalidate the main page
    return JSON.parse(JSON.stringify(updatedPassport));
  } catch (error) {
    console.error("Error updating passport photo:", error);
    throw new Error("Failed to update passport photo");
  }
}

export async function updatePassportSignature(
  id: string,
  signature: string,
  signatureId: string
) {
  try {
    mongooseConnect();
    const updatedPassport = await Rider.findByIdAndUpdate(
      id,
      { $set: { signature, signatureId } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPassport) {
      throw new Error("Passport not found");
    }

    revalidatePath("/"); // Revalidate the main page
    return JSON.parse(JSON.stringify(updatedPassport));
  } catch (error) {
    console.error("Error updating passport signature:", error);
    throw new Error("Failed to update passport signature");
  }
}
