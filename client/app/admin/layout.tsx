import { ReactNode, Suspense } from "react";
import { AdminSideBarWithUser } from "@/components/sidebar_wrapper";
import { UserProvider } from "../context/UserContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProvider>
        <AdminSideBarWithUser>{children}</AdminSideBarWithUser>
      </UserProvider>
    </Suspense>
  );
}