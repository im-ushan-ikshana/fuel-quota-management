"use client";
import Link from "next/link";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Fuel,
  Building2,
  MapPinned,
  Truck,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">Admin Panel</div>
      <nav className="sidebar-nav flex flex-col gap-3">
        <Link href="/admin/dashboard" className="sidebar-link">
          <LayoutDashboard className="inline-block mr-5 w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/admin/fuel-quota" className="sidebar-link">
          <Fuel className="inline-block mr-5 w-5 h-5" />
          Fuel Quotas
        </Link>
        <Link href="/admin/fuel-stations" className="sidebar-link">
          <Building2 className="inline-block mr-5 w-5 h-5" />
          Fuel Stations
        </Link>
        <Link href="/admin/fuel-tracking" className="sidebar-link">
          <MapPinned className="inline-block mr-5 w-5 h-5" />
          Fuel Tracking
        </Link>
        <Link href="/admin/vehicles" className="sidebar-link">
          <Truck className="inline-block mr-5 w-5 h-5" />
          Vehicles
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
