import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  PieChart, 
  Pill, 
  FileText, 
  UserRound, 
  UserCog, 
  Receipt, 
  Truck, 
  BarChart, 
  Settings, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <PieChart className="w-5 h-5 mr-3" /> },
    { path: "/inventory", label: "Inventory", icon: <Pill className="w-5 h-5 mr-3" /> },
    { path: "/prescriptions", label: "Prescriptions", icon: <FileText className="w-5 h-5 mr-3" /> },
    { path: "/patients", label: "Patients", icon: <UserRound className="w-5 h-5 mr-3" /> },
    { path: "/doctors", label: "Doctors", icon: <UserCog className="w-5 h-5 mr-3" /> },
    { path: "/billing", label: "Billing", icon: <Receipt className="w-5 h-5 mr-3" /> },
    { path: "/transactions", label: "Transactions", icon: <Receipt className="w-5 h-5 mr-3" /> },
    { path: "/suppliers", label: "Suppliers", icon: <Truck className="w-5 h-5 mr-3" /> },
    { path: "/reports", label: "Reports", icon: <BarChart className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className={`${isOpen ? 'flex' : 'hidden'} md:flex md:flex-shrink-0 transition-all duration-300`}>
      <div className="flex flex-col w-64 bg-slate-800 text-white">
        <div className="flex items-center justify-center h-16 px-4 bg-slate-900">
          <span className="text-xl font-semibold">PharmaSys</span>
        </div>
        
        {/* User Info */}
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.name ? getInitials(user.name) : "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400">{user?.role || "User"}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer ${
                  location === item.path
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        
        {/* Bottom Links */}
        <div className="px-4 py-3 mt-auto border-t border-slate-700">
          <Link href="/settings">
            <div className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 mt-1 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
