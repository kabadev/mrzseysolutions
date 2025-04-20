"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <header className="flex fixed border-b z-30  h-[70px] w-full bg-card top-0 items-center justify-between px-10">
      <div className="flex items-center gap-2">
        <Image
          src={"/gimglogo.png"}
          alt="logo"
          width={700}
          height={500}
          className="h-[150px] -mt-4 w-full object-cover"
        />
      </div>

      <UserButton />
    </header>
  );
};

export default Navbar;
