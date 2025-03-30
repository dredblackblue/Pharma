import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CheckCircle,
  ChevronLeft,
  Loader2,
  Package,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Medicine, Order, OrderItem } from "@shared/schema";

interface OrderWithDetails extends Order {
  items: OrderItem[];
  supplier: string;
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [openAlert, setOpenAlert] = useState(false);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<OrderWithDetails>({
    queryKey: ["/api/orders", orderId],
  });

  const { data: medicines } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
    enabled: !!order,
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order deleted",
        description: "The order has been deleted successfully.",
      });
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsDeliveredMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/orders/${orderId}`, { status: "delivered" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Order marked as delivered",
        description: "The order has been marked as delivered and medicine stock updated.",
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

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/orders/${orderId}`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled.",
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

  const confirmDelete = () => {
    deleteOrderMutation.mutate();
    setOpenAlert(false);
  };

  const getMedicineName = (medicineId: number) => {
    if (!medicines) return "Loading...";
    const medicine = medicines.find((m) => m.id === medicineId);
    return medicine ? medicine.name : "Unknown";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Unpaid</Badge>;
      case "partial":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The order you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            {order.supplier} - {format(new Date(order.orderDate), "PPP")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold flex items-center">
              {getStatusBadge(order.status)}
            </div>
            {order.status === "pending" && (
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={() => markAsDeliveredMutation.mutate()}
                  className="flex items-center"
                  size="sm"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cancelOrderMutation.mutate()}
                  className="flex items-center"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>{getPaymentStatusBadge(order.paymentStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">
                  ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{format(new Date(order.orderDate), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Delivery:</span>
                <span>
                  {order.expectedDeliveryDate
                    ? format(new Date(order.expectedDeliveryDate), "PPP")
                    : "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>Items included in this order</CardDescription>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getMedicineName(item.medicineId)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${parseFloat(item.unitPrice.toString()).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      ${(parseFloat(item.unitPrice.toString()) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No items in this order
            </div>
          )}
        </CardContent>
      </Card>

      {order.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end mt-6 space-x-2">
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
        <Button
          variant="destructive"
          onClick={() => setOpenAlert(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Order
        </Button>
      </div>

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this order and all its items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}