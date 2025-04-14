import type { Metadata } from "next";

import DashboardMetrics from "@/components/dashboard/dashboard-metrics";

import RecentPassportsTable from "@/components/dashboard/recent-passports-table";
import {
  getDashboardMetrics,
  getPassportTypeDistribution,
  getGenderDistribution,
  getAgeRangeDistribution,
  getMonthlyIssuance,
  getRecentPassports,
} from "@/app/_actions/dasboard";
import PassportCharts from "@/components/dashboard/passport-charts";

export const metadata: Metadata = {
  title: "MRZ Passport System Dashboard",
  description: "Dashboard for managing passport issuance and tracking",
};

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [
    metrics,
    passportTypeData,
    genderData,
    ageRangeData,
    monthlyIssuanceData,
    recentPassports,
  ] = await Promise.all([
    getDashboardMetrics(),
    getPassportTypeDistribution(),
    getGenderDistribution(),
    getAgeRangeDistribution(),
    getMonthlyIssuance(),
    getRecentPassports(5),
  ]);

  return (
    <div className="h-[calc(100vh-65px)] mb-16 bg-slate-50 overflow-y-auto overflow-x-hidden">
      <main className=" w-full px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <DashboardMetrics metrics={metrics} />
        <PassportCharts
          passportTypeData={passportTypeData}
          genderData={genderData}
          ageRangeData={ageRangeData}
          monthlyIssuanceData={monthlyIssuanceData}
        />
        <RecentPassportsTable initialPassports={recentPassports} />
      </main>
    </div>
  );
}
