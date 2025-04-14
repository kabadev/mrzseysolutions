"use client";

import * as React from "react";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { RiderProvider } from "@/context/riderContext";
import { UserProvider } from "@/context/userContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <RiderProvider>
        <div>
          <Sidebar />
          <div className="">
            <Navbar />
            <div className="fixed mt-[70px] md:w-[calc(100%-250px)] md:ml-[250px]">
              {children}
            </div>
          </div>
        </div>
      </RiderProvider>
    </UserProvider>
  );
}
