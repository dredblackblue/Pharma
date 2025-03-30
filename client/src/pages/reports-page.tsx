import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Download, PieChart, BarChart, LineChart, FileBarChart } from "lucide-react";
import type { Medicine, Transaction, Prescription } from "@shared/schema";

const ReportsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportType, setReportType] = useState("inventory");
  const [timeFrame, setTimeFrame] = useState("month");

  // Fetch data for reports
  const { data: medicines, isLoading: medicinesLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  // Helper functions to calculate report data
  const calculateInventoryValue = () => {
    if (!medicines) return 0;
    return medicines.reduce((total, medicine) => {
      return total + (medicine.price * medicine.stockQuantity);
    }, 0);
  };

  const calculateLowStockItems = () => {
    if (!medicines) return 0;
    return medicines.filter(medicine => medicine.stockQuantity < 10).length;
  };

  const calculateExpiringItems = () => {
    if (!medicines) return 0;
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    return medicines.filter(medicine => {
      const expiryDate = new Date(medicine.expiryDate);
      return expiryDate <= threeMonthsFromNow;
    }).length;
  };

  const calculateTotalSales = () => {
    if (!transactions) return 0;
    return transactions.reduce((total, transaction) => {
      return total + transaction.totalAmount;
    }, 0);
  };

  const calculateAverageSale = () => {
    if (!transactions || transactions.length === 0) return 0;
    return calculateTotalSales() / transactions.length;
  };

  const calculateTotalPrescriptions = () => {
    return prescriptions?.length || 0;
  };

  // Handle download report
  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF or CSV report
    alert("This would download a " + reportType + " report for the " + timeFrame + " timeframe.");
  };

  const isLoading = medicinesLoading || transactionsLoading || prescriptionsLoading;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Reports & Analytics</h1>
              <p className="text-slate-500 mt-1">Generate and view pharmacy operational reports</p>
            </div>
            
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="inventory" value={reportType} onValueChange={setReportType}>
            <TabsList className="mb-6">
              <TabsTrigger value="inventory">
                <PieChart className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="sales">
                <BarChart className="h-4 w-4 mr-2" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="prescriptions">
                <LineChart className="h-4 w-4 mr-2" />
                Prescriptions
              </TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <>
                <TabsContent value="inventory">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Inventory Value</CardTitle>
                        <CardDescription>Current stock value</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary-600">
                          ${calculateInventoryValue().toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Low Stock Items</CardTitle>
                        <CardDescription>Items below threshold</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-amber-500">
                          {calculateLowStockItems()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Expiring Soon</CardTitle>
                        <CardDescription>Expires in 3 months</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-500">
                          {calculateExpiringItems()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Inventory Distribution</CardTitle>
                        <CardDescription>By Category</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <FileBarChart className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-4 text-slate-500">Interactive chart would be displayed here.</p>
                          <p className="text-xs text-slate-400 mt-2">Distribution of inventory by category</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Stock Level Analysis</CardTitle>
                        <CardDescription>Current Status</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <FileBarChart className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-4 text-slate-500">Interactive chart would be displayed here.</p>
                          <p className="text-xs text-slate-400 mt-2">Analysis of stock levels across inventory</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="sales">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Sales</CardTitle>
                        <CardDescription>For selected period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary-600">
                          ${calculateTotalSales().toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Average Sale</CardTitle>
                        <CardDescription>Per transaction</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-500">
                          ${calculateAverageSale().toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Transactions</CardTitle>
                        <CardDescription>Number of sales</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-500">
                          {transactions?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Over Time</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <FileBarChart className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-4 text-slate-500">Interactive chart would be displayed here.</p>
                          <p className="text-xs text-slate-400 mt-2">Sales trend over the selected time period</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>By Revenue</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <FileBarChart className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-4 text-slate-500">Interactive chart would be displayed here.</p>
                          <p className="text-xs text-slate-400 mt-2">Top selling products by revenue</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="prescriptions">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Prescriptions</CardTitle>
                        <CardDescription>For selected period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary-600">
                          {calculateTotalPrescriptions()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Active Prescriptions</CardTitle>
                        <CardDescription>Currently active</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-500">
                          {prescriptions?.filter(p => p.status === "Active").length || 0}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Expired Prescriptions</CardTitle>
                        <CardDescription>No longer valid</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-500">
                          {prescriptions?.filter(p => p.status === "Expired").length || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Prescription Trend</CardTitle>
                        <CardDescription>Over Time</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <FileBarChart className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-4 text-slate-500">Interactive chart would be displayed here.</p>
                          <p className="text-xs text-slate-400 mt-2">Prescription trend over the selected time period</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Prescribed Medications</CardTitle>
                        <CardDescription>By Frequency</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <FileBarChart className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="mt-4 text-slate-500">Interactive chart would be displayed here.</p>
                          <p className="text-xs text-slate-400 mt-2">Most commonly prescribed medications</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;