"use client";
import { ReactNode } from 'react';
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function TransactionsLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
  
  // Determine activeTab & activeDot based on current path
  const getActiveTab = () => {
    if (pathname.includes("transactions")) return ["Transactions","1"];
    if (pathname.includes("goals")) return ["Goals","2"];
    if (pathname.includes("shop")) return ["Shop","3"];
    return ["Overview","0"];
  }


  return (
    <div>
      <div className="static top-0 left-0 right-0 z-50">
        <Navbar activeTab={getActiveTab()[0]} activeDot={parseInt(getActiveTab()[1])}/>
      </div>
      <div className="pt-16 px-4 md:px-8 lg:px-16">
      {children}
      </div>
    </div>
  );
}