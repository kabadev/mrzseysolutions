import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, FileText, Printer, Users } from "lucide-react";

interface DashboardMetricsProps {
  metrics: {
    totalPassports: number;
    printedPassports: number;
    pendingPrinting: number;
    activeUsers: number;
  };
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Passports</CardTitle>
          <FileText className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalPassports.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total passports in system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Printed Passports
          </CardTitle>
          <Printer className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.printedPassports.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.totalPassports > 0
              ? `${(
                  (metrics.printedPassports / metrics.totalPassports) *
                  100
                ).toFixed(1)}% of total`
              : "0% of total"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Printing
          </CardTitle>
          <FileCheck className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.pendingPrinting.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.totalPassports > 0
              ? `${(
                  (metrics.pendingPrinting / metrics.totalPassports) *
                  100
                ).toFixed(1)}% of total`
              : "0% of total"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Users</CardTitle>
          <Users className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          <p className="text-xs text-slate-500 mt-1">Active system operators</p>
        </CardContent>
      </Card>
    </div>
  );
}
