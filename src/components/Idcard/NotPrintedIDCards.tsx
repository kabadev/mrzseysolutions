import React, { useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import IdCardDetail from "@/components/Idcard/IdCardDetail";
import { useRiderContext } from "@/context/riderContext";
import { generateCardFront } from "@/lib/help";
import { Rider } from "@/types/idcard-type";

export function NotPrintedIDCards({
  onProvideData,
  singleBatchTab,
}: {
  singleBatchTab: string;
  onProvideData: (riders: Rider[]) => void;
}) {
  const {
    // riders,
    notPrintedRiders,
    totalRiders,
    totalFetchedRiders,
    currentPage,
    isLoading,
    fetchNotPrintedRiders,
    setCurrentPage,
  } = useRiderContext();
  useEffect(() => {
    fetchNotPrintedRiders();
  }, [fetchNotPrintedRiders]);

  const [selectedRider, setSelectedRider] = React.useState(
    notPrintedRiders[0] || null
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  const [cardFronts, setCardFronts] = React.useState<any>([]);
  const [filteredRiders, setFilteredRiders] = React.useState<Rider[]>([]);

  const pageSize = 50;
  const totalPages = Math.ceil(filteredRiders.length / pageSize);

  const paginatedRiders = React.useMemo(() => {
    return filteredRiders.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredRiders, currentPage]);

  React.useEffect(() => {
    if (notPrintedRiders.length > 0 && !selectedRider) {
      setSelectedRider(notPrintedRiders[0]);
    }
  }, [notPrintedRiders, selectedRider]);

  React.useEffect(() => {
    const filtered = notPrintedRiders.filter(
      (rider) =>
        rider.givenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.passportNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        rider.personalNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRiders(filtered);
  }, [notPrintedRiders, searchQuery]);

  React.useEffect(() => {
    const fetchCardFronts = async () => {
      const results = await Promise.all(
        paginatedRiders.map(async (rider) => {
          return await generateCardFront(rider);
        })
      );
      setCardFronts(results);
    };
    fetchCardFronts();
  }, [paginatedRiders]);

  useEffect(() => {
    onProvideData(paginatedRiders);
  }, [onProvideData]);

  return (
    <div className="w-full flex p-0  ">
      <div className="w-1/3 border-r bg-white h-[calc(100vh-120px)] mt-[40px] relative">
        <div className=" h-[60px] flex items-center p-2 w-full ">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Passport Number, Given & Surname and Personal number"
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-auto absolute w-full h-[calc(100%-140px)] overflow-y-auto ">
          <Table>
            <TableHeader>
              <TableRow className="p-0">
                <TableHead>Photo</TableHead>
                <TableHead>Passport Number</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="p-4">
              {paginatedRiders.map((rider) => (
                <TableRow
                  key={rider.passportNumber}
                  className={`cursor-pointer ${
                    selectedRider?.passportNumber === rider.passportNumber
                      ? "bg-muted"
                      : ""
                  }`}
                  onClick={() => setSelectedRider(rider)}
                >
                  <TableCell>
                    <img
                      alt="photo"
                      src={rider.photo || "/profile.png"}
                      width={100}
                      height={100}
                      className="w-10 h-12  object-cover"
                    />
                  </TableCell>
                  <TableCell>{rider.passportNumber}</TableCell>
                  <TableCell>{`${rider.givenName} ${rider.surname}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isLoading &&
            [1, 2, 3, 4, 5, 6, 7].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 border-b p-2">
                <div className="w-[40px] h-[40px] rounded-sm bg-accent animate-pulse"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <p className="bg-accent h-3 w-[200px] animate-pulse rounded-full"></p>
                  <p className="bg-accent h-2 w-[100px] animate-pulse rounded-full"></p>
                </div>
                <div className="bg-accent h-3 w-[100px] animate-pulse rounded-full"></div>
              </div>
            ))}
        </div>
        <div className="absolute w-full h-[80px] bottom-0 mt-4 flex items-center justify-between p-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => {
              setCurrentPage((prev) => {
                const nextPage = prev + 1;
                if (nextPage * pageSize >= totalFetchedRiders - pageSize) {
                  fetchNotPrintedRiders();
                }
                return nextPage;
              });
            }}
            disabled={currentPage * pageSize >= totalRiders || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {singleBatchTab === "single" ? (
        <div className="w-1/2 flex-1 p-6 h-[calc(100vh-120px)] mt-[40px] overflow-y-auto">
          {selectedRider && (
            <IdCardDetail
              setSelectedRider={setSelectedRider}
              rider={selectedRider}
            />
          )}
        </div>
      ) : (
        <div className="w-1/2 grid grid-cols-2 flex-1 p-3 gap-3  h-[calc(100vh-120px)] mt-[40px] overflow-y-auto">
          {notPrintedRiders.map((rider, index) => {
            return (
              <div
                key={index}
                className="fle h-[240px] gap-4 w-full  relative "
              >
                <Image
                  height={500}
                  width={300}
                  className="w-full h-full "
                  src={cardFronts[index] ? cardFronts[index] : "/loader.png"}
                  alt=""
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
