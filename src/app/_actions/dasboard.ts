"use server";

import { mongooseConnect } from "@/lib/mongoose";
import Rider from "@/models/Rider";
import { clerkClient } from "@clerk/nextjs/server";

export async function getDashboardMetrics() {
  await mongooseConnect();

  try {
    const totalPassports = await Rider.countDocuments();
    const printedPassports = await Rider.countDocuments({ isPrinted: true });
    const pendingPrinting = await Rider.countDocuments({ isPrinted: false });

    // Count active users (unique userId values)
    const { data } = await (await clerkClient()).users.getUserList();

    return JSON.parse(
      JSON.stringify({
        totalPassports,
        printedPassports,
        pendingPrinting,
        // activeUsers: 0, // data.length,
        activeUsers: data.length,
      })
    );
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw new Error("Failed to fetch dashboard metrics");
  }
}

export async function getPassportTypeDistribution() {
  await mongooseConnect();

  try {
    const passportTypes = await Rider.aggregate([
      {
        $group: {
          _id: "$passportType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "PC"] }, then: "Regular" },
                { case: { $eq: ["$_id", "PD"] }, then: "Diplomatic" },
                { case: { $eq: ["$_id", "PS"] }, then: "Service" },
              ],
              default: "Other",
            },
          },
          value: "$count",
        },
      },
    ]);

    return JSON.parse(JSON.stringify(passportTypes));
  } catch (error) {
    console.error("Error fetching passport type distribution:", error);
    throw new Error("Failed to fetch passport type distribution");
  }
}

export async function getGenderDistribution() {
  await mongooseConnect();

  try {
    const genderDistribution = await Rider.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
        },
      },
    ]);

    return JSON.parse(JSON.stringify(genderDistribution));
  } catch (error) {
    console.error("Error fetching gender distribution:", error);
    throw new Error("Failed to fetch gender distribution");
  }
}

export async function getAgeRangeDistribution() {
  await mongooseConnect();

  try {
    const ageRangeDistribution = await Rider.aggregate([
      {
        $addFields: {
          age: {
            $divide: [
              { $subtract: [new Date(), "$birthDate"] },
              365 * 24 * 60 * 60 * 1000, // Convert milliseconds to years
            ],
          },
        },
      },
      {
        $project: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 18] }, then: "Under 18" },
                {
                  case: {
                    $and: [{ $gte: ["$age", 18] }, { $lt: ["$age", 30] }],
                  },
                  then: "18-29",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 30] }, { $lt: ["$age", 45] }],
                  },
                  then: "30-44",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 45] }, { $lt: ["$age", 60] }],
                  },
                  then: "45-59",
                },
              ],
              default: "60+",
            },
          },
        },
      },
      {
        $group: {
          _id: "$ageGroup",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return JSON.parse(JSON.stringify(ageRangeDistribution));
  } catch (error) {
    console.error("Error fetching age range distribution:", error);
    throw new Error("Failed to fetch age range distribution");
  }
}

export async function getMonthlyIssuance() {
  await mongooseConnect();

  try {
    const currentYear = new Date().getFullYear();
    const monthlyIssuance = await Rider.aggregate([
      {
        $match: {
          issueDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$issueDate" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Jan" },
                { case: { $eq: ["$_id", 2] }, then: "Feb" },
                { case: { $eq: ["$_id", 3] }, then: "Mar" },
                { case: { $eq: ["$_id", 4] }, then: "Apr" },
                { case: { $eq: ["$_id", 5] }, then: "May" },
                { case: { $eq: ["$_id", 6] }, then: "Jun" },
                { case: { $eq: ["$_id", 7] }, then: "Jul" },
                { case: { $eq: ["$_id", 8] }, then: "Aug" },
                { case: { $eq: ["$_id", 9] }, then: "Sep" },
                { case: { $eq: ["$_id", 10] }, then: "Oct" },
                { case: { $eq: ["$_id", 11] }, then: "Nov" },
                { case: { $eq: ["$_id", 12] }, then: "Dec" },
              ],
              default: "Unknown",
            },
          },
          count: 1,
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in missing months with zero counts
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = months.map((month) => {
      const found = monthlyIssuance.find((item: any) => item.month === month);
      return found || { month, count: 0 };
    });
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Error fetching monthly issuance:", error);
    throw new Error("Failed to fetch monthly issuance");
  }
}

export async function getRecentPassports(limit = 5) {
  await mongooseConnect();

  try {
    const recentPassports = await Rider.find()
      .sort({ issueDate: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(
      JSON.stringify(
        recentPassports.map((passport: any) => ({
          ...passport,
          id: passport._id.toString(),
          birthDate: passport.birthDate.toISOString().split("T")[0],
          issueDate: passport.issueDate.toISOString().split("T")[0],
          expiryDate: passport.expiryDate.toISOString().split("T")[0],
          passportTypeDisplay:
            passport.passportType === "PC"
              ? "Regular"
              : passport.passportType === "PD"
              ? "Diplomatic"
              : passport.passportType === "PS"
              ? "Service"
              : "Other",
        }))
      )
    );
  } catch (error) {
    console.error("Error fetching recent passports:", error);
    throw new Error("Failed to fetch recent passports");
  }
}
