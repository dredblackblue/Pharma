import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ExtendedTransaction = Transaction & {
  patient: string;
};

const RecentTransactions = () => {
  const { data: transactions, isLoading } = useQuery<ExtendedTransaction[]>({
    queryKey: ["/api/dashboard/recent-transactions"],
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-medium text-slate-800">Recent Transactions</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="p-1 rounded-md hover:bg-slate-200 text-slate-500">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="p-1 rounded-md hover:bg-slate-200 text-slate-500">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {Array(4).fill(0).map((_, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-medium text-slate-800">Recent Transactions</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="p-1 rounded-md hover:bg-slate-200 text-slate-500">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="p-1 rounded-md hover:bg-slate-200 text-slate-500">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-8 text-center text-slate-500">
          No transactions found
        </div>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-500';
      case 'processing':
        return 'bg-amber-100 text-amber-500';
      case 'refunded':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-medium text-slate-800">Recent Transactions</h2>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="p-1 rounded-md hover:bg-slate-200 text-slate-500">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="p-1 rounded-md hover:bg-slate-200 text-slate-500">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  #{`TRX-${transaction.id}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {transaction.patient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  ${Number(transaction.totalAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 sm:px-6 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing {transactions.length} of {transactions.length} transactions
        </div>
        <a href="#transactions" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          View All Transactions
          <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default RecentTransactions;
