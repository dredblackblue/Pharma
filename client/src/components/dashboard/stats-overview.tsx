import { ArrowUp } from "lucide-react";
import { Pill, AlertTriangle, FileText, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  totalInventory: number;
  inventoryGrowth: number;
  lowStock: number;
  lowStockIncrease: number;
  prescriptionsToday: number;
  prescriptionsGrowth: number;
  todayRevenue: string;
  revenueGrowth: number;
};

const StatsOverview = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-slate-100 p-3 rounded-full">
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-24 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Inventory",
      value: stats?.totalInventory || 0,
      growth: stats?.inventoryGrowth || 0,
      icon: <Pill className="text-primary-600" />,
      bgColor: "bg-primary-50",
      growthColor: "text-green-500"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStock || 0,
      growth: stats?.lowStockIncrease || 0,
      icon: <AlertTriangle className="text-amber-500" />,
      bgColor: "bg-amber-50",
      growthColor: "text-red-500"
    },
    {
      title: "Prescriptions Today",
      value: stats?.prescriptionsToday || 0,
      growth: stats?.prescriptionsGrowth || 0,
      icon: <FileText className="text-slate-600" />,
      bgColor: "bg-slate-100",
      growthColor: "text-green-500"
    },
    {
      title: "Today's Revenue",
      value: `$${stats?.todayRevenue || '0'}`,
      growth: stats?.revenueGrowth || 0,
      icon: <DollarSign className="text-green-500" />,
      bgColor: "bg-green-50",
      growthColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${card.bgColor} p-3 rounded-full`}>
              {card.icon}
            </div>
            <div className="ml-4">
              <p className="text-slate-500 text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-semibold text-slate-800">{card.value}</h3>
            </div>
          </div>
          <div className={`mt-3 text-xs flex items-center ${card.growthColor}`}>
            <ArrowUp className="mr-1 h-3 w-3" />
            <span>{card.growth}%</span>
            <span className="text-slate-400 ml-1">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
