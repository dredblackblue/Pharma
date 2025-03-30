import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronDown,
  Loader2,
  PackageOpen,
  Plus,
  Search,
  ShoppingCart,
  Truck,
  X,
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order, Supplier } from "@shared/schema";

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest("PUT", `/api/orders/${orderId}`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsDeliveredMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest("PUT", `/api/orders/${orderId}`, { status: "delivered" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Order delivered",
        description: "The order has been marked as delivered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSupplierName = (supplierId: number) => {
    if (!suppliers) return "Loading...";
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "Unknown";
  };

  const filteredOrders = orders
    ? orders.filter((order) => {
        const matchesSearch =
          searchTerm === "" ||
          getSupplierName(order.supplierId)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm);

        const matchesStatus =
          statusFilter.length === 0 || statusFilter.includes(order.status);

        return matchesSearch && matchesStatus;
      })
    : [];

  // Sort orders by date (newest first)
  const sortedOrders = [...(filteredOrders || [])].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Unpaid
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Partial
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingOrders || isLoadingSuppliers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage your supplier orders and inventory
          </p>
        </div>
        <Button onClick={() => navigate("/add-order")}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Overview of your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {orders?.filter((o) => o.status === "pending").length || 0}
                </p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <PackageOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">
                  {orders?.filter((o) => o.status === "delivered").length || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>View all supplier orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-2.5"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  Status Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("pending")}
                  onCheckedChange={(checked) => {
                    setStatusFilter(
                      checked
                        ? [...statusFilter, "pending"]
                        : statusFilter.filter((s) => s !== "pending")
                    );
                  }}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("delivered")}
                  onCheckedChange={(checked) => {
                    setStatusFilter(
                      checked
                        ? [...statusFilter, "delivered"]
                        : statusFilter.filter((s) => s !== "delivered")
                    );
                  }}
                >
                  Delivered
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("cancelled")}
                  onCheckedChange={(checked) => {
                    setStatusFilter(
                      checked
                        ? [...statusFilter, "cancelled"]
                        : statusFilter.filter((s) => s !== "cancelled")
                    );
                  }}
                >
                  Cancelled
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {sortedOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{getSupplierName(order.supplierId)}</TableCell>
                      <TableCell>
                        {format(new Date(order.orderDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View
                          </Button>
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsDeliveredMutation.mutate(order.id)}
                              >
                                Deliver
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelOrderMutation.mutate(order.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <PackageOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter.length > 0
                  ? "Try adjusting your filters"
                  : "Create your first order to get started"}
              </p>
              <Button onClick={() => navigate("/add-order")}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {sortedOrders.length} of {orders?.length || 0} orders
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}