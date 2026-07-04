//src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, HeartPulse, UserSearch, Wrench, CalendarDays } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard/ids-alerts', label: 'IDS Alerts', icon: <ShieldAlert className="w-5 h-5" /> },
    { to: '/dashboard/safe-commands', label: 'Safe Commands', icon: <HeartPulse className="w-5 h-5" /> },
    { to: '/dashboard/view-patient', label: 'View Patient Info', icon: <UserSearch className="w-5 h-5" /> },
    { to: '/dashboard/firmware-update', label: 'Firmware Update', icon: <Wrench className="w-5 h-5" /> },
    { to: '/dashboard/appointments', label: 'Appointments', icon: <CalendarDays className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col shadow-lg">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        Admin Dashboard
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
