import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, FileText, RefreshCcw, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Transaction } from "@shared/schema";

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch transactions
  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Function to format currency
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Get appropriate badge color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Transactions</h1>
              <p className="text-slate-500 mt-1">Manage and view all pharmacy transactions</p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/transactions/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                </Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader className="bg-white rounded-t-lg border-b border-slate-200">
              <CardTitle>Transaction List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="mb-2 font-medium">No transactions found</p>
                  <p className="text-sm max-w-md mx-auto mb-6">
                    There are no transactions in the system yet. Create your first transaction by clicking the button below.
                  </p>
                  <Link href="/transactions/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">#{transaction.id}</TableCell>
                        <TableCell>
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>#{transaction.patientId}</TableCell>
                        <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}