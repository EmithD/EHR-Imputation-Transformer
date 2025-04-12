import { ReactNode } from "react";
import AdminSideBar from "./admin_sidebar";

export async function AdminSideBarWithUser({ children }: { children: ReactNode }) {
    return <AdminSideBar>{children}</AdminSideBar>;
}