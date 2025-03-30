import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Search, Bell, Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-600"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Search bar */}
        <div className="ml-4 md:ml-0 flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
              type="text" 
              placeholder="Search for medicines, patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Right side icons */}
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <button className="p-2 text-slate-400 hover:text-slate-500 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {/* Profile dropdown */}
          <div className="ml-3 relative">
            <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.name ? getInitials(user.name) : "U"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
