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
      <Navbar activeTab={getActiveTab()[0]} activeDot={parseInt(getActiveTab()[1])}/>
      <div>
      {children}
      </div>
    </div>
  );
}