import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Landmark,
  FolderKanban,
  FileCheck,
  Handshake,
  BookText,
} from "lucide-react";

import '@/styles/unified_styles.css';

export default function Sidebar() {
  return (
    <aside className="sidebar noprint">
      {/* Logo */}
      <Link to="/agenda" className="sidebar-logo-container">
        <img src="/logo_dgr.png" alt="Logo DGR" className="sidebar-logo" />
      </Link>

      {/* Ícones */}
      <div className="sidebar-icons">
        <Link to="/agenda" title="Agenda de Compromissos">
          <CalendarDays size={28} className="sidebar-icon" />
        </Link>
        <Link to="/parteadversa" title="Parte Adversa e Contratos">
          <Users size={28} className="sidebar-icon" />
        </Link>
        <Link to="/processos" title="Processos">
          <FolderKanban size={28} className="sidebar-icon" />
        </Link>
        <Link to="/acordos" title="Acordos">
          <Handshake size={28} className="sidebar-icon" />
        </Link>
        <Link to="/colaboradoresdgr" title="Colaboradores do Escritório">
          <Landmark size={28} className="sidebar-icon" />
        </Link>
      </div>
    </aside>
  );
}
