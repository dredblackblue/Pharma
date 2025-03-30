import { useQuery } from "@tanstack/react-query";
import { Medicine } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";

const ExpiringMedications = () => {
  const { data: expiringMeds, isLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/dashboard/expiring-medications"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-medium text-slate-800">Expiring Medications</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="p-4 flex justify-between items-center">
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
          <Skeleton className="h-4 w-40 ml-auto" />
        </div>
      </div>
    );
  }

  if (!expiringMeds || expiringMeds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-medium text-slate-800">Expiring Medications</h2>
        </div>
        <div className="p-8 text-center text-slate-500">
          No expiring medications found
        </div>
        <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
          <a href="#inventory/expiring" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-end">
            View All Expiring Items
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  // Get expiry days and determine status color
  const getExpiryInfo = (expiryDate: Date | string) => {
    const today = new Date();
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const daysLeft = differenceInDays(expiry, today);
    
    let textColor = 'text-slate-500';
    if (daysLeft <= 7) {
      textColor = 'text-red-500';
    } else if (daysLeft <= 30) {
      textColor = 'text-amber-500';
    }
    
    return {
      daysLeft,
      textColor
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h2 className="font-medium text-slate-800">Expiring Medications</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {expiringMeds.slice(0, 3).map(medicine => {
          const { daysLeft, textColor } = getExpiryInfo(medicine.expiryDate);
          return (
            <div key={medicine.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-slate-800">{medicine.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Batch #{medicine.batchNumber || 'N/A'}</p>
              </div>
              <div className={`text-xs font-medium ${textColor}`}>
                {daysLeft <= 0 
                  ? 'Expired' 
                  : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
        <a href="#inventory/expiring" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-end">
          View All Expiring Items
          <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default ExpiringMedications;
