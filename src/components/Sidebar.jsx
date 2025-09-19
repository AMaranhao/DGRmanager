import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarDays,
  Users,
  Landmark,
  FolderKanban,
  Handshake,
  FileEdit,
} from "lucide-react";

import "@/styles/unified_styles.css";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      label: "Agenda de Compromissos",
      path: "/agenda",
      icon: <CalendarDays size={28} className="sidebar-icon" />,
      allowed: ["todos"], // todos os cargos
    },
    {
      label: "Partes Adversas",
      path: "/parteadversa",
      icon: <Users size={28} className="sidebar-icon" />,
      allowed: ["gestor", "advogado"],
    },
    {
      label: "Contratos",
      path: "/contratos",
      icon: <FileEdit size={28} className="sidebar-icon" />,
      allowed: ["gestor", "advogado"],
    },
    {
      label: "Processos",
      path: "/processos",
      icon: <FolderKanban size={28} className="sidebar-icon" />,
      allowed: ["gestor", "advogado", "estagiario"],
    },
    {
      label: "Acordos",
      path: "/acordos",
      icon: <Handshake size={28} className="sidebar-icon" />,
      allowed: ["gestor", "advogado"],
    },
    {
      label: "Colaboradores do Escritório",
      path: "/colaboradores",
      icon: <Landmark size={28} className="sidebar-icon" />,
      allowed: ["gestor"],
    },
  ];

  return (
    <aside className="sidebar noprint">
      {/* Logo */}
      <Link to="/agenda" className="sidebar-logo-container">
        <img src="/TyrHub_Sidebar.png" alt="Logo DGR" className="sidebar-logo" />
      </Link>

      {/* Ícones */}
      <div className="sidebar-icons">
        {menuItems.map((item) => {
          const podeVer =
            item.allowed.includes("todos") || item.allowed.includes(user?.cargo);

          return (
            podeVer && (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={isActive(item.path) ? "active" : ""}
              >
                {item.icon}
              </Link>
            )
          );
        })}
      </div>
    </aside>
  );
}
