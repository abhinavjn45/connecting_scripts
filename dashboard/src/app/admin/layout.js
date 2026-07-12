"use client";

import AdminLayout from "@/components/AdminLayout";
import { usePathname } from "next/navigation";

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  
  let title = "Dashboard";
  if (pathname.includes("/profile")) title = "My Profile";
  else if (pathname.includes("/users")) title = "User Management";
  else if (pathname.includes("/password")) title = "Password Manager";
  else if (pathname.includes("/backups")) title = "Database Backups";
  else if (pathname.includes("/health")) title = "Site Health";

  return (
    <AdminLayout title={title}>
      {children}
    </AdminLayout>
  );
}
