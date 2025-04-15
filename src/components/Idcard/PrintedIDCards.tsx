import React, { useEffect } from "react";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Rider } from "@/types/idcard-type";

export function PrintedIDCards() {
  const {
    printedRiders,
    totalRiders,
    totalFetchedRiders,
    currentPage,
    isLoading,
    searchQuery,
    fetchRiders,
    setCurrentPage,
    setSearchQuery,
    fetchPrintedRiders,
  } = useRiderContext();

  useEffect(() => {
    fetchPrintedRiders();
  }, [fetchPrintedRiders]);

  const [selectedRider, setSelectedRider] = React.useState(
    printedRiders[0] || null
  );
  const [filteredRiders, setFilteredRiders] = React.useState<Rider[]>([]);

  const pageSize = 50;
  const totalPages = Math.ceil(filteredRiders.length / pageSize);

  const paginatedRiders = React.useMemo(() => {
    return filteredRiders.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [printedRiders, filteredRiders, currentPage]);

  React.useEffect(() => {
    if (printedRiders.length > 0 && !selectedRider) {
      setSelectedRider(printedRiders[0]);
    }
  }, [printedRiders, selectedRider]);

  React.useEffect(() => {
    const filtered = printedRiders.filter(
      (rider) =>
        rider.givenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.passportNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        rider.personalNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRiders(filtered);
  }, [printedRiders, searchQuery]);

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
                <TableHead>ID</TableHead>
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
                      className="w-8 h-8 rounded-md object-cover object-top"
                    />
                  </TableCell>
                  <TableCell>{rider.passportNumber}</TableCell>
                  <TableCell>{`${rider.givenName}  ${rider.surname}`}</TableCell>
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
                  fetchRiders();
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

      <div className="w-1/2 flex-1 p-6 h-[calc(100vh-120px)] mt-[40px] overflow-y-auto">
        {selectedRider && (
          <IdCardDetail
            setSelectedRider={setSelectedRider}
            rider={selectedRider}
          />
        )}
      </div>
    </div>
  );
}
