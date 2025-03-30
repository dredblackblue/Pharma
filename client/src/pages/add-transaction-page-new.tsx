import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Medicine, Patient, Prescription } from "@shared/schema";

// Create form schema with coerce for proper type conversion
const formSchema = z.object({
  patientId: z.coerce.number().min(1, { message: "Please select a patient" }),
  prescriptionId: z.coerce.number().optional(), 
  transactionDate: z.string().min(1, { message: "Transaction date is required" }),
  totalAmount: z.coerce.number().min(0, { message: "Total amount must be a positive number" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      medicineId: z.coerce.number().min(1, { message: "Please select a medicine" }),
      quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
      unitPrice: z.coerce.number().min(0, { message: "Unit price must be a positive number" }),
    })
  ).min(1, { message: "At least one item is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const AddTransactionPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get patients
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Get prescriptions
  const { data: prescriptions } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  // Get medicines
  const { data: medicines } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: 0,
      prescriptionId: undefined,
      transactionDate: new Date().toISOString().split('T')[0], // Just date part in YYYY-MM-DD format
      totalAmount: 0,
      paymentMethod: "Cash",
      status: "Completed",
      notes: "",
      items: [
        {
          medicineId: 0,
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  });

  // Field array for transaction items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Helper to update price based on selected medicine
  const updatePrice = (index: number, medicineId: number) => {
    const medicine = medicines?.find((m) => m.id === medicineId);
    if (medicine) {
      form.setValue(`items.${index}.unitPrice`, medicine.unitPrice || 0);
      calculateTotal();
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    const items = form.getValues().items;
    const total = items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);
    
    // Format to 2 decimal places to avoid floating point issues
    const formattedTotal = parseFloat(total.toFixed(2));
    form.setValue("totalAmount", formattedTotal);
    return formattedTotal;
  };

  // Initialize first item when medicines are loaded
  useEffect(() => {
    if (medicines && medicines.length > 0 && fields.length === 1 && form.getValues().items[0].medicineId === 0) {
      const firstMedicine = medicines[0];
      form.setValue("items.0.medicineId", firstMedicine.id);
      form.setValue("items.0.unitPrice", firstMedicine.unitPrice || 0);
      calculateTotal();
    }
  }, [medicines, form]);

  // Create transaction mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format data properly for API
      const transactionData = {
        patientId: Number(data.patientId),
        // Only include prescriptionId if it's defined and not zero
        ...(data.prescriptionId && Number(data.prescriptionId) !== 0 ? { prescriptionId: Number(data.prescriptionId) } : {}),
        // Convert YYYY-MM-DD to ISO date string
        transactionDate: new Date(data.transactionDate + "T00:00:00Z").toISOString(),
        // Format to 2 decimal places for money
        totalAmount: parseFloat(Number(data.totalAmount).toFixed(2)),
        paymentMethod: data.paymentMethod,
        status: data.status,
        notes: data.notes || "",
        items: data.items.map(item => ({
          medicineId: Number(item.medicineId),
          quantity: Number(item.quantity),
          unitPrice: parseFloat(Number(item.unitPrice).toFixed(2))
        })),
      };
      
      console.log("Sending transaction data:", transactionData);
      
      const res = await apiRequest("POST", "/api/transactions", transactionData);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        throw new Error(JSON.stringify(errorData));
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction Created",
        description: "The transaction has been created successfully",
      });
      setLocation("/billing");
    },
    onError: (error: Error) => {
      console.error("Transaction error:", error);
      let errorMessage = "An unknown error occurred";
      
      try {
        // Try to parse error message if it's JSON
        errorMessage = JSON.stringify(JSON.parse(error.message), null, 2);
      } catch (e) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Creating Transaction",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // Calculate the final total
    const finalTotal = calculateTotal();
    
    // Submit with the calculated total
    mutation.mutate({
      ...data,
      totalAmount: finalTotal
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Create New Transaction</h1>
            <p className="text-slate-500 mt-1">Record a new sale of medications</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-5xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Transaction Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800">Transaction Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Patient selection */}
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value?.toString() || "0"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a patient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients?.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                  {patient.firstName} {patient.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Prescription selection (optional) */}
                    <FormField
                      control={form.control}
                      name="prescriptionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescription (Optional)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              if (value === "none") {
                                field.onChange(undefined);
                              } else {
                                field.onChange(value);
                              }
                            }} 
                            value={field.value?.toString() || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a prescription" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {prescriptions?.map((prescription) => (
                                <SelectItem key={prescription.id} value={prescription.id.toString()}>
                                  Prescription #{prescription.id} ({new Date(prescription.issueDate).toLocaleDateString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Transaction date */}
                    <FormField
                      control={form.control}
                      name="transactionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              onChange={field.onChange}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Payment method */}
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "Cash"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                              <SelectItem value="Debit Card">Debit Card</SelectItem>
                              <SelectItem value="Insurance">Insurance</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "Completed"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                              <SelectItem value="Refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any special notes about this transaction" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Transaction Items Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-800">Transaction Items</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const firstMedicineId = medicines && medicines.length > 0 ? Number(medicines[0].id) : 0;
                        const firstMedicinePrice = medicines && medicines.length > 0 ? Number(medicines[0].unitPrice) : 0;
                        
                        append({
                          medicineId: firstMedicineId,
                          quantity: 1,
                          unitPrice: firstMedicinePrice,
                        });
                        
                        setTimeout(() => calculateTotal(), 0);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-slate-200">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Medicine selection */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.medicineId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medicine</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    updatePrice(index, Number(value));
                                  }} 
                                  value={field.value?.toString() || "0"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select medicine" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {medicines?.map((medicine) => (
                                      <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                        {medicine.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Quantity */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      calculateTotal();
                                    }}
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Unit Price */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      calculateTotal();
                                    }}
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Delete button */}
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (fields.length > 1) {
                                  remove(index);
                                  setTimeout(() => calculateTotal(), 0);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Total amount */}
                  <div className="flex justify-end">
                    <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200">
                      <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-800">
                        ${form.watch("totalAmount").toFixed(2)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => calculateTotal()}
                      >
                        Recalculate
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Form actions */}
                <div className="pt-6 space-x-2 flex justify-end border-t border-slate-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/billing")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Create Transaction'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddTransactionPage;