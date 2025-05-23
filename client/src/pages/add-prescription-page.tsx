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
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { 
  insertPrescriptionSchema, 
  insertPrescriptionItemSchema,
  Medicine, 
  Patient, 
  Doctor 
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define the schema for prescription items
const prescriptionItemSchema = z.object({
  medicineId: z.number({
    required_error: "Medicine is required",
  }),
  quantity: z.number({
    required_error: "Quantity is required",
  }).min(1, "Quantity must be at least 1"),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
});

// Extend the schema for form validation
const formSchema = z.object({
  patientId: z.number({
    required_error: "Patient is required",
  }),
  doctorId: z.number({
    required_error: "Doctor is required",
  }),
  issueDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()),
  status: z.string().default("Active"),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine is required"),
});

type FormValues = z.infer<typeof formSchema>;

const AddPrescriptionPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch data for dropdowns
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const { data: medicines } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      status: "Active",
      notes: "",
      items: [
        {
          medicineId: 0,
          quantity: 1,
          dosage: "",
          instructions: "",
        },
      ],
    },
  });

  // Set up field array for prescription items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format the prescription data
      const prescription = {
        patientId: data.patientId,
        doctorId: data.doctorId,
        issueDate: typeof data.issueDate === 'string' ? data.issueDate : data.issueDate.toISOString(),
        expiryDate: typeof data.expiryDate === 'string' ? data.expiryDate : data.expiryDate.toISOString(),
        status: data.status,
        notes: data.notes || ""
      };
      
      // Create the prescription first
      const res = await apiRequest("POST", "/api/prescriptions", prescription);
      const prescriptionResult = await res.json();
      
      // Then add each prescription item with the new prescription ID
      for (const item of data.items) {
        await apiRequest("POST", "/api/prescription-items", {
          prescriptionId: prescriptionResult.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          dosage: item.dosage || "",
          instructions: item.instructions || ""
        });
      }
      
      return prescriptionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      toast({
        title: "Prescription Created",
        description: "The prescription has been created successfully",
      });
      setLocation("/prescriptions");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create prescription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (patients?.length && doctors?.length && medicines?.length) {
      form.reset({
        ...form.getValues(),
        patientId: patients[0]?.id || 0,
        doctorId: doctors[0]?.id || 0,
        items: [
          {
            medicineId: medicines[0]?.id || 0,
            quantity: 1,
            dosage: "",
            instructions: "",
          },
        ],
      });
    }
  }, [patients, doctors, medicines, form]);

  const onSubmit = (data: FormValues) => {
    // Convert any date strings to proper ISO format
    const formattedData = {
      ...data,
      patientId: Number(data.patientId),
      doctorId: Number(data.doctorId),
      items: data.items.map(item => ({
        ...item,
        medicineId: Number(item.medicineId),
        quantity: Number(item.quantity)
      }))
    };
    
    mutation.mutate(formattedData);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Create New Prescription</h1>
            <p className="text-slate-500 mt-1">Issue a new prescription for a patient</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-5xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Prescription Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800">Prescription Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            value={field.value?.toString()}
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
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors?.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                  Dr. {doctor.firstName} {doctor.lastName}
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
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              onChange={(e) => {
                                if (e.target.value) {
                                  field.onChange(new Date(e.target.value).toISOString());
                                }
                              }}
                              value={
                                field.value 
                                  ? new Date(field.value).toISOString().split('T')[0]
                                  : new Date().toISOString().split('T')[0]
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              onChange={(e) => {
                                if (e.target.value) {
                                  field.onChange(new Date(e.target.value).toISOString());
                                }
                              }}
                              value={
                                field.value 
                                  ? new Date(field.value).toISOString().split('T')[0]
                                  : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
                              }
                            />
                          </FormControl>
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any special instructions or notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Prescription Items Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-800">Prescription Items</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({
                        medicineId: medicines && medicines.length > 0 ? Number(medicines[0].id) : 0,
                        quantity: 1,
                        dosage: "",
                        instructions: "",
                      })}
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
                                  onValueChange={(value) => field.onChange(Number(value))} 
                                  value={field.value?.toString()}
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
                                    onChange={e => field.onChange(Number(e.target.value) || 1)} 
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.dosage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 1 tablet twice daily" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-end">
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
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.instructions`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Special instructions for this medication" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="pt-6 space-x-2 flex justify-end border-t border-slate-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/prescriptions")}
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
                        Saving...
                      </>
                    ) : (
                      'Create Prescription'
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

export default AddPrescriptionPage;