"use client";
import React, { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-col flex-grow">
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-6 bg-gray-100 flex-grow overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
