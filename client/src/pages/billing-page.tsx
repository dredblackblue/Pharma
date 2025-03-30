import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Transaction } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Receipt, MoreHorizontal, UserRound, FileText, Filter, Download, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const BillingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [_, setLocation] = useLocation();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const filteredTransactions = transactions?.filter(transaction => 
    transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Processing</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 hover:bg-slate-100">Refunded</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Billing & Transactions</h1>
            <Button onClick={() => setLocation("/transactions/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Transactions Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-50 p-3 rounded-full">
                  <Receipt className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-slate-500 text-sm font-medium">Total Sales</p>
                  <h3 className="text-2xl font-semibold text-slate-800">$12,548.25</h3>
                </div>
              </div>
              <div className="mt-3 text-xs flex items-center text-green-500">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>15%</span>
                <span className="text-slate-400 ml-1">this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-50 p-3 rounded-full">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-slate-500 text-sm font-medium">Pending</p>
                  <h3 className="text-2xl font-semibold text-slate-800">$1,250.80</h3>
                </div>
              </div>
              <div className="mt-3 text-xs flex items-center text-amber-500">
                <span>5 transactions</span>
                <span className="text-slate-400 ml-1">pending approval</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-50 p-3 rounded-full">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-slate-500 text-sm font-medium">Completed</p>
                  <h3 className="text-2xl font-semibold text-slate-800">124</h3>
                </div>
              </div>
              <div className="mt-3 text-xs flex items-center text-green-500">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>8%</span>
                <span className="text-slate-400 ml-1">this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-50 p-3 rounded-full">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-slate-500 text-sm font-medium">Refunded</p>
                  <h3 className="text-2xl font-semibold text-slate-800">$578.50</h3>
                </div>
              </div>
              <div className="mt-3 text-xs flex items-center text-red-500">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>2%</span>
                <span className="text-slate-400 ml-1">this month</span>
              </div>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Prescription</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 mr-2 text-blue-500" />
                          #{`TRX-${transaction.id}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserRound className="h-4 w-4 mr-2 text-slate-400" />
                          Patient #{transaction.patientId}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.prescriptionId ? (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            #{transaction.prescriptionId}
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(parseISO(transaction.transactionDate.toString()), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(transaction.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Receipt className="h-4 w-4 mr-2" />
                              View transaction
                            </DropdownMenuItem>
                            <DropdownMenuItem>Print receipt</DropdownMenuItem>
                            <DropdownMenuItem>View patient</DropdownMenuItem>
                            {transaction.status.toLowerCase() === 'completed' && (
                              <DropdownMenuItem>Issue refund</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Void transaction</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 sm:px-6 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {filteredTransactions?.length || 0} of {transactions?.length || 0} transactions
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                <Button variant="outline" size="sm" className="ml-3">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="ml-3">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BillingPage;
