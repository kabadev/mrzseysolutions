"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, CalendarOffIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { ChevronDown, ChevronUp, Filter, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  fetchPassports,
  getPassportById,
  updatePassport,
  deletePassport,
  updatePassportPhoto,
  updatePassportSignature,
} from "@/app/_actions/passport";
import { Passport } from "@/types/passportType";
import { PassportDetailSheet } from "@/components/passport/passport-detail-sheet";

import { EditPhotoSheet } from "@/components/passport/edit-photo-sheet";
import { DeletePassportDialog } from "@/components/passport/delete-passport-dialog";
import { EditpassportSheet } from "@/components/passport/edit-passport-sheet";

export default function PassportDashboard() {
  const [passports, setPassports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPassport, setSelectedPassport] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [photoEditOpen, setPhotoEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterIssueDateStart, setFilterIssueDateStart] = useState<
    Date | undefined
  >(undefined);
  const [filterIssueDateEnd, setFilterIssueDateEnd] = useState<
    Date | undefined
  >(undefined);
  const [filterPrintedStatus, setFilterPrintedStatus] = useState<string | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPassportId, setLoadingPassportId] = useState<string | null>(
    null
  );
  // Load passports with server action
  const loadPassports = async () => {
    try {
      setLoading(true);
      const result = await fetchPassports({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortField,
        sortDirection,
        issueDateStart: filterIssueDateStart || null,
        issueDateEnd: filterIssueDateEnd || null,
        printedStatus: filterPrintedStatus,
      });

      setPassports(result.passports!);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      console.error("Error loading passports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load passports when filters or pagination changes
  useEffect(() => {
    loadPassports();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    sortField,
    sortDirection,
    filterIssueDateStart,
    filterIssueDateEnd,
    filterPrintedStatus,
  ]);

  // Format date to a more readable format
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterIssueDateStart(undefined);
    setFilterIssueDateEnd(undefined);
    setFilterPrintedStatus(null);
  };

  // Handle view details
  const handleViewDetails = async (id: string) => {
    try {
      setLoadingDetail(true);
      setLoadingPassportId(id);
      const passport = await getPassportById(id);
      setSelectedPassport(passport!);
      setDetailOpen(true);
      setLoadingDetail(false);
      setLoadingPassportId(null);
    } catch (error) {
      console.error("Error fetching passport details:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    setDetailOpen(false);
    setEditOpen(true);
  };

  // Handle edit photo
  const handleEditPhoto = () => {
    setDetailOpen(false);
    setPhotoEditOpen(true);
  };

  // Handle delete
  const handleDelete = () => {
    setDetailOpen(false);
    setDeleteDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async (updatedPassport: any) => {
    try {
      setIsSubmitting(true);

      if (!updatedPassport._id) {
        throw new Error("Passport ID is missing");
      }

      const result = await updatePassport(
        updatedPassport._id.toString(),
        updatedPassport
      );

      setSelectedPassport(result);
      setEditOpen(false);
      setDetailOpen(true);

      // Reload passports to reflect changes
      loadPassports();
    } catch (error) {
      console.error("Error updating passport:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save photo
  const handleSavePhoto = async (
    id: string,
    photo: string,
    photoId: string,
    signature: string,
    signatureId: string
  ) => {
    try {
      setIsSubmitting(true);

      // Update photo
      if (photo && photoId) {
        await updatePassportPhoto(id, photo, photoId);
      }

      // Update signature
      if (signature && signatureId) {
        await updatePassportSignature(id, signature, signatureId);
      }

      // Get updated passport
      const updatedPassport = await getPassportById(id);

      setSelectedPassport(updatedPassport);
      setPhotoEditOpen(false);
      setDetailOpen(true);

      // Reload passports to reflect changes
      loadPassports();
    } catch (error) {
      console.error("Error updating passport photo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedPassport || !selectedPassport._id) return;

    try {
      setIsSubmitting(true);
      await deletePassport(selectedPassport._id.toString());

      setDeleteDialogOpen(false);

      // Reload passports to reflect changes
      loadPassports();
    } catch (error) {
      console.error("Error deleting passport:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="p-4 h-[calc(100vh-65px)] overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Passports</h1>

      <div className="flex items-start gap-6 justify-between ">
        {/* Search Bar */}
        <div className="relative mb-6 md:w-1/2">
          <span>Search</span>
          <div className="flex pl-4 items-center border  rounded-md">
            <Search className="  text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by passport number, personal number, name or surname..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className=" shadow-none pr-4 py-2 w-full bg-none border-none"
            />
          </div>
        </div>

        <div className="mb-6 md:w-1/2">
          <div className="flex items-center mb-4  gap-4">
            {/* Issue Date Filter */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label className="text-xs">Issue From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterIssueDateStart ? (
                          format(filterIssueDateStart, "PPP")
                        ) : (
                          <span>Start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterIssueDateStart}
                        onSelect={setFilterIssueDateStart}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Issue To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarOffIcon className="mr-2 h-4 w-4" />
                        {filterIssueDateEnd ? (
                          format(filterIssueDateEnd, "PPP")
                        ) : (
                          <span>End date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterIssueDateEnd}
                        onSelect={setFilterIssueDateEnd}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Printed Status Filter */}
            <div className="space-y-1">
              <Label className="text-xs">Printed Status</Label>
              <Select
                value={filterPrintedStatus || "all"}
                onValueChange={(value) =>
                  setFilterPrintedStatus(value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="printed">Printed</SelectItem>
                  <SelectItem value="not-printed">Not Printed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Passport Table */}
      <div className=" rounded-lg overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Photo.</TableHead>
              <TableHead className="w-[120px]">Passport No.</TableHead>
              <TableHead className="w-[120px]">Personal No.</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Birth Date</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("issueDate")}
                >
                  Issue Date
                  {sortField === "issueDate" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("expiryDate")}
                >
                  Expiry Date
                  {sortField === "expiryDate" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-x-auto">
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : passports.length > 0 ? (
              passports.map((passport) => (
                <TableRow key={passport._id.toString()}>
                  <TableCell className="w-[10px]">
                    <img
                      alt="photo"
                      src={passport.photo || "/profile.png"}
                      width={100}
                      height={100}
                      className="w-10 h-12  object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {passport.passportNumber}
                  </TableCell>
                  <TableCell>{passport.personalNumber}</TableCell>
                  <TableCell>{`${passport.givenName} ${passport.surname}`}</TableCell>

                  <TableCell>{passport.gender}</TableCell>
                  <TableCell>{formatDate(passport.birthDate)}</TableCell>
                  <TableCell>{formatDate(passport.issueDate)}</TableCell>
                  <TableCell>{formatDate(passport.expiryDate)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        passport.isPrinted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {passport.isPrinted ? "Printed" : "Not Printed"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewDetails(passport._id.toString())}
                      disabled={loading}
                    >
                      {passport._id === loadingPassportId && loadingDetail ? (
                        <>
                          View Details
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        "View Details"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No passports found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number;

              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Detail Sheet */}
      {selectedPassport && (
        <PassportDetailSheet
          passport={selectedPassport}
          open={detailOpen}
          isLoading={loadingDetail}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
          onEditPhoto={handleEditPhoto}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Sheet */}
      {selectedPassport && (
        <EditpassportSheet
          passport={selectedPassport}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleSaveEdit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Edit Photo Sheet */}
      {selectedPassport && (
        <EditPhotoSheet
          passport={selectedPassport}
          open={photoEditOpen}
          onOpenChange={setPhotoEditOpen}
          onSave={(photo, photoId, signature, signatureId) =>
            handleSavePhoto(
              selectedPassport._id.toString(),
              photo,
              photoId,
              signature,
              signatureId
            )
          }
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Dialog */}
      {selectedPassport && (
        <DeletePassportDialog
          passport={selectedPassport}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
