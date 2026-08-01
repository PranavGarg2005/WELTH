"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon, Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from "lucide-react";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryColors } from "@/data/categories";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectValue, SelectItem, SelectGroup, SelectTrigger } from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

type Transaction = {
  id: string;
  date: string | Date;
  description?: string;
  category: string;
  amount: number | string;
  type: "INCOME" | "EXPENSE";
  isRecurring: boolean;
  recurringInterval?: keyof typeof RECURRING_INTERVALS;
  nextRecurringDate?: string | Date;
  [key: string]: any; // remove once you know the full shape from your schema
};

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
} as const;

type SortField = "date" | "amount" | "category";
type SortDirection = "asc" | "desc";

const TransactionTable = ({ transactions }: { transactions: Transaction[] }) => {

  const [selectedId, setselectedId] = useState<string[]>([]);
  const [sortConfig, setsortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedId.length} transactions?`)) {
      return;
    }
    deleteFn(selectedId);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transaction deleted successfully!");
    }
  }, [deleted, deleteLoading]);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) => transaction.description?.toLowerCase().includes(searchLower));
    }

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "RECURRING") {
          return transaction.isRecurring;
        }

        if (recurringFilter === "NON-RECURRING") {
          return !transaction.isRecurring;
        }

        return true;
      });
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;

        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    return result;
  }, [
    transactions,
    searchTerm,
    typeFilter,
    recurringFilter,
    sortConfig,
  ]);

  const handleSort = (field: SortField) => {
    setsortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    setselectedId((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  console.log(selectedId);

  const handleSelectAll = () => {
    setselectedId((current) =>
      current.length === filteredAndSortedTransactions.length ? [] : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRecurringFilter("");
    setTypeFilter("");
    setselectedId([]);
  };

  return (

    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search Transactions...." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={recurringFilter} onValueChange={setRecurringFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="RECURRING">Recurring Only</SelectItem>
              <SelectItem value="NON-RECURRING">Non-recurring Only</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {selectedId.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedId.length})
            </Button>
          </div>
        )}

        {(searchTerm || typeFilter || recurringFilter) && (
          <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters">
            <X className="h-4 w-5" />
          </Button>
        )}
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox onCheckedChange={handleSelectAll} checked={selectedId.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0} />
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date {" "}{sortConfig.field === "date" && (
                    sortConfig.direction === "asc" ? (<ChevronUpIcon className="ml-1 h-4 w-4" />) : (<ChevronDownIcon className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Description</TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category {" "}{sortConfig.field === "category" && (
                    sortConfig.direction === "asc" ? (<ChevronUpIcon className="ml-1 h-4 w-4" />) : (<ChevronDownIcon className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  Amount
                  {sortConfig.field === "amount" && (
                    sortConfig.direction === "asc" ? (<ChevronUpIcon className="ml-1 h-4 w-4" />) : (<ChevronDownIcon className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Recurring</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedId.includes(transaction.id)} />
                  </TableCell>

                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>

                  <TableCell>{transaction.description}</TableCell>

                  <TableCell className="capitalize">
                    <span
                      className="px-2 py-1 rounded text-white text-sm"
                      style={{
                        backgroundColor:
  (categoryColors as Record<string, string>)[transaction.category] || "#666",
                      }}
                    >
                      {transaction.category}
                    </span>
                  </TableCell>

                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color:
                        transaction.type === "EXPENSE"
                          ? "red"
                          : "green",
                    }}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}$
                    {Number(transaction.amount).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                              <RefreshCcw className="h-3 w-3" />
                              {transaction.recurringInterval && RECURRING_INTERVALS[transaction.recurringInterval]}
                            </Badge>
                          </TooltipTrigger>

                          <TooltipContent>
                            <div>
                              <div className="text-sm">Next Date:</div>
                              <div className="font-medium">{transaction.nextRecurringDate && format(new Date(transaction.nextRecurringDate), "PP")}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One Time
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Link href={`/transaction/create?edit=${transaction.id}`}>Edit</Link></DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteFn([transaction.id])}>Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;