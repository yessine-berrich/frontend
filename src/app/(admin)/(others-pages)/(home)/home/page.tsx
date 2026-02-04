import BarChartOne from "@/components/charts/bar/BarChartOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import HomePage from "@/components/home/home";
import { BarChart2Icon } from "lucide-react";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default function BlankPage() {
  return (
    <div>
      <HomePage />
      
    </div>
  );
}
