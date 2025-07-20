import { MainHeader } from "@/components/layouts";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div className="border-grid flex flex-1 flex-col">
        <MainHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
