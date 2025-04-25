import { Link } from 'react-router-dom';
import { KeyRound, ClipboardList, BookText, Building2 } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-20 bg-[#2f4674] text-white flex flex-col h-screen">
      {/* LOGO no topo */}
      <div className="h-20 flex items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-10 h-10" />
      </div>

      {/* ÍCONES centralizados com espaçamento */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <Link to="/dashboard" title="Chaves">
          <KeyRound size={28} color="white" />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <Link to="/emprestimos" title="Empréstimos">
          <ClipboardList size={28} color="white" />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <Link to="/infraestrutura" title="Instalações">
          <Building2 size={28} color="white" />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <Link to="/relatorios" title="Relatórios">
          <BookText size={28} color="white" />
        </Link>
      </div>
    </aside>
  );
}
