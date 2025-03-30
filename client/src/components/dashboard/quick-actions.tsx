import { FileText, UserPlus, Pill, Receipt } from "lucide-react";
import { Link } from "wouter";

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      name: "New Prescription",
      icon: <FileText className="h-6 w-6" />,
      path: "/prescriptions/new"
    },
    {
      id: 2,
      name: "Add Patient",
      icon: <UserPlus className="h-6 w-6" />,
      path: "/patients/new"
    },
    {
      id: 3,
      name: "Add Medicine",
      icon: <Pill className="h-6 w-6" />,
      path: "/inventory/new"
    },
    {
      id: 4,
      name: "Create Invoice",
      icon: <Receipt className="h-6 w-6" />,
      path: "/billing/new"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h2 className="font-medium text-slate-800">Quick Actions</h2>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        {actions.map(action => (
          <Link key={action.id} href={action.path}>
            <a className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                {action.icon}
              </span>
              <span className="text-sm font-medium text-slate-700">{action.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
