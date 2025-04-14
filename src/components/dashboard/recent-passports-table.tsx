"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Printer, Eye, FileCheck } from "lucide-react";

interface Passport {
  id: string;
  passportNumber: string;
  surname: string;
  givenName: string;
  passportType: string;
  passportTypeDisplay: string;
  nationality: string;
  birthDate: string;
  gender: string;
  issueDate: string;
  expiryDate: string;
  isPrinted: boolean;
}

interface RecentPassportsTableProps {
  initialPassports: Passport[];
}

export default function RecentPassportsTable({
  initialPassports,
}: RecentPassportsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [passports] = useState<Passport[]>(initialPassports);

  const filteredPassports = passports.filter(
    (passport) =>
      passport.passportNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      passport.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      passport.givenName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Passports</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search passports..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passport Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPassports.length > 0 ? (
                filteredPassports.map((passport) => (
                  <TableRow key={passport.id}>
                    <TableCell className="font-medium">
                      {passport.passportNumber}
                    </TableCell>
                    <TableCell>{`${passport.surname}, ${passport.givenName}`}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          passport.passportType === "PD"
                            ? "default"
                            : passport.passportType === "PS"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {passport.passportTypeDisplay}
                      </Badge>
                    </TableCell>
                    <TableCell>{passport.nationality}</TableCell>
                    <TableCell>
                      {new Date(passport.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(passport.expiryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={passport.isPrinted ? "default" : "outline"}
                      >
                        {passport.isPrinted ? "Printed" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No passports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
