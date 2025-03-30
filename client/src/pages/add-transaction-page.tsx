import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Loader2, Plus, Trash2, Calculator } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { insertTransactionSchema, Medicine, Patient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Define the schema for transaction items
const transactionItemSchema = z.object({
  medicineId: z.union([
    z.string().min(1, "Medicine is required"),
    z.number({
      required_error: "Medicine is required",
    })
  ]),
  quantity: z.union([
    z.string().min(1, "Quantity is required").transform(val => parseInt(val)),
    z.number().min(1, "Quantity must be at least 1")
  ]),
  unitPrice: z.union([
    z.string().min(1, "Price is required").transform(val => parseFloat(val)),
    z.number().min(0, "Price cannot be negative")
  ]),
});

// Extend the schema for form validation
const formSchema = insertTransactionSchema.extend({
  patientId: z.union([
    z.string().min(1, "Patient is required"),
    z.number({
      required_error: "Patient is required",
    })
  ]),
  prescriptionId: z.union([
    z.string().transform(val => val ? parseInt(val) : undefined),
    z.number().optional(),
    z.undefined()
  ]),
  items: z.array(transactionItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

const AddTransactionPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch data for dropdowns
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: medicines } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: 0,
      transactionDate: new Date(),
      totalAmount: "0",
      paymentMethod: "Cash",
      status: "Completed",
      notes: "",
      items: [
        {
          medicineId: 0 as number,
          quantity: 1 as number,
          unitPrice: 0 as number,
        },
      ],
    },
  });

  // Set up field array for transaction items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate total amount whenever items change
  useEffect(() => {
    const calculateTotal = () => {
      const items = form.getValues("items");
      const total = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      setTotalAmount(total);
      form.setValue("totalAmount", total.toString());
    };

    calculateTotal();
    
    // Set up a subscription to form values changes
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("items")) {
        calculateTotal();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, fields]);

  // Initialize medicine price when medicine is selected
  const updateMedicinePrice = (index: number, medicineId: number) => {
    if (medicines) {
      const medicine = medicines.find(m => m.id === medicineId);
      if (medicine) {
        form.setValue(`items.${index}.unitPrice`, parseFloat(medicine.unitPrice.toString()));
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] }); // Inventory will be updated
      toast({
        title: "Transaction Created",
        description: "The transaction has been processed successfully",
      });
      setLocation("/billing");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to process transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // Convert string IDs to numbers, and handle data appropriately
    const formattedData = {
      ...data,
      patientId: Number(data.patientId),
      totalAmount: data.totalAmount.toString(), // API expects string for totalAmount
      transactionDate: data.transactionDate, // Pass the Date object directly
      items: data.items.map(item => ({
        ...item,
        medicineId: Number(item.medicineId),
      })),
    };
    
    mutation.mutate(formattedData);
  };

  // Reset form when data is loaded
  useEffect(() => {
    if (patients?.length && medicines?.length) {
      form.reset({
        ...form.getValues(),
        patientId: Number(patients[0]?.id || 0),
        items: [
          {
            medicineId: Number(medicines[0]?.id || 0),
            quantity: 1,
            unitPrice: parseFloat(medicines[0]?.unitPrice?.toString() || "0"),
          },
        ],
      });
    }
  }, [patients, medicines]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Create New Transaction</h1>
            <p className="text-slate-500 mt-1">Process a new sale of medications</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-5xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Transaction Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800">Transaction Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value?.toString() || ''}
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
                    
                    <FormField
                      control={form.control}
                      name="transactionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                if (e.target.value) {
                                  const date = new Date(e.target.value);
                                  field.onChange(date);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
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
                              <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
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
                    
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount ($)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input 
                                type="number" 
                                step="0.01" 
                                readOnly 
                                {...field} 
                                value={totalAmount.toFixed(2)} 
                              />
                              <Calculator className="ml-2 text-slate-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes about this transaction" {...field} value={field.value || ''} />
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
                        const medicineId = medicines && medicines.length > 0 ? Number(medicines[0].id) : 0;
                        const unitPrice = medicines && medicines.length > 0 ? parseFloat(medicines[0].unitPrice?.toString() || "0") : 0;
                        append({
                          medicineId: medicineId as number,
                          quantity: 1,
                          unitPrice: unitPrice as number,
                        });
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
                          <FormField
                            control={form.control}
                            name={`items.${index}.medicineId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medicine</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(parseInt(value));
                                    updateMedicinePrice(index, parseInt(value));
                                  }}
                                  defaultValue={field.value?.toString() || ''}
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
                                    {...field} 
                                    onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <FormLabel>Subtotal</FormLabel>
                              <div className="text-sm font-medium">
                                ${((form.getValues(`items.${index}.quantity`) || 0) * (form.getValues(`items.${index}.unitPrice`) || 0)).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => fields.length > 1 && remove(index)}
                                disabled={fields.length <= 1}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-end mt-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-64">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Subtotal:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tax:</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg pt-2 border-t border-slate-200">
                        <span>Total:</span>
                        <span className="text-primary-600">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
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
                      'Process Transaction'
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