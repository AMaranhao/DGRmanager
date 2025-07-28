import { useEffect, useState } from "react";
import { User, Settings, LogOut, Mail, Key, Accessibility, Type, Moon, Sun } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import '@/styles/unified_styles.css';


export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="header">
      <div className="header-spacer" />

      <div className="header-center">
        <h1 className="header-title-with-logo">
          <img src="/logo_dgr2.png" alt="Logo HC" className="header-logo" />
          <span>Sistema Jurídico Administrativo DGR</span>
        </h1>
      </div>


      <div className="header-actions noprint">
        {/* Dropdown Configurações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="header-icon-button" title="Configurações">
              <Settings className="icon" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-menu">
            <DropdownMenuItem className="dropdown-item" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="dropdown-icon" /> : <Moon className="dropdown-icon" />}
              <span>Modo {isDark ? "Claro" : "Escuro"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown Perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="header-icon-button" title="Perfil">
              <User className="icon" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-menu">
            <DropdownMenuItem className="dropdown-item" onClick={() => navigate('/perfil')}>
              <User className="dropdown-icon" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="dropdown-item" onClick={logout}>
              <LogOut className="dropdown-icon" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
