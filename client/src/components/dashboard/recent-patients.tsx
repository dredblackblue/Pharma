import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const RecentPatients = () => {
  const { data: recentPatients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/dashboard/recent-patients"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-medium text-slate-800">Recent Patients</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600">
                <Skeleton className="h-full w-full rounded-full" />
              </div>
              <div className="ml-3">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="ml-auto h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
          <Skeleton className="h-4 w-40 ml-auto" />
        </div>
      </div>
    );
  }

  if (!recentPatients || recentPatients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-medium text-slate-800">Recent Patients</h2>
        </div>
        <div className="p-8 text-center text-slate-500">
          No recent patients found
        </div>
        <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
          <Link href="/patients">
            <a className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-end">
              View All Patients
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h2 className="font-medium text-slate-800">Recent Patients</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {recentPatients.map(patient => (
          <div key={patient.id} className="p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600">
              {getInitials(patient.firstName, patient.lastName)}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-slate-800">{`${patient.firstName} ${patient.lastName}`}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Last visit: {format(parseISO(patient.created_at.toString()), 'MMM dd, yyyy')}
              </p>
            </div>
            <Link href={`/patients/${patient.id}`}>
              <a className="ml-auto p-2 text-slate-400 hover:text-blue-500">
                <ChevronRight className="h-5 w-5" />
              </a>
            </Link>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
        <Link href="/patients">
          <a className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-end">
            View All Patients
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </div>
    </div>
  );
};

export default RecentPatients;
