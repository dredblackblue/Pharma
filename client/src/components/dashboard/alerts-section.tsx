import { 
  AlertTriangle, 
  AlertCircle, 
  Truck 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const alerts = [
  {
    id: 1,
    title: "Expired Medications",
    description: "5 medications have expired. Please remove them from inventory.",
    icon: <AlertTriangle />,
    bgColor: "bg-red-100",
    textColor: "text-red-500",
    buttonText: "View Details",
    buttonBgColor: "bg-red-50",
    buttonTextColor: "text-red-500",
    buttonHoverBgColor: "hover:bg-red-100"
  },
  {
    id: 2,
    title: "Low Stock Warning",
    description: "12 medications are running low. Please reorder soon.",
    icon: <AlertCircle />,
    bgColor: "bg-amber-100",
    textColor: "text-amber-500",
    buttonText: "Review Stock",
    buttonBgColor: "bg-amber-50",
    buttonTextColor: "text-amber-500",
    buttonHoverBgColor: "hover:bg-amber-100"
  },
  {
    id: 3,
    title: "Pending Deliveries",
    description: "3 shipments are scheduled for delivery today.",
    icon: <Truck />,
    bgColor: "bg-blue-100",
    textColor: "text-blue-500",
    buttonText: "Track Shipments",
    buttonBgColor: "bg-blue-50",
    buttonTextColor: "text-blue-500",
    buttonHoverBgColor: "hover:bg-blue-100"
  }
];

const AlertsSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h2 className="font-medium text-slate-800">Critical Alerts</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {alerts.map(alert => (
          <div key={alert.id} className="p-4 flex items-start">
            <div className="flex-shrink-0 mt-1">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${alert.bgColor} ${alert.textColor}`}>
                {alert.icon}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-slate-800">{alert.title}</h3>
              <div className="mt-1 text-sm text-slate-500">
                <p>{alert.description}</p>
              </div>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`px-3 py-1 h-auto text-xs ${alert.buttonTextColor} ${alert.buttonBgColor} ${alert.buttonHoverBgColor} border-transparent`}
                >
                  {alert.buttonText}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-slate-50 text-right sm:px-6 border-t border-slate-200">
        <a href="#alerts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View All Alerts
          <span className="ml-1">→</span>
        </a>
      </div>
    </div>
  );
};

export default AlertsSection;
