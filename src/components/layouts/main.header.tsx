import { routes } from "@/config";
import { Chip } from "@mui/material";
import { LuSquareTerminal } from "react-icons/lu";
import { PiBuildingApartmentDuotone } from "react-icons/pi";
import { Link } from "react-router-dom";

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-blue-500 shadow-lg backdrop-blur-sm border-b border-blue-400/20">
      <div className="mx-auto px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to={routes.root} className="flex items-center gap-2">
            <PiBuildingApartmentDuotone className="h-6 w-6 text-white" />
            <h1 className="text-xl font-semibold text-white">Hệ thống quản lý tiến độ dự án xây dựng</h1>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            {import.meta.env.DEV && (
              <Chip
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuSquareTerminal style={{ width: '16px', height: '16px' }} />
                DEVELOPMENT
                </span>
              }
              variant="outlined"
              sx={{
                background: 'linear-gradient(to right, #f59e0b, #f97316)',
                color: 'white',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                fontSize: '0.75rem',
                fontWeight: 500,
                '&:hover': {
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}