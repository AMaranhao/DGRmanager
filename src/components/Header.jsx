export default function Header() {
    return (
      <header className="h-20 bg-white flex justify-between items-center px-8 shadow">
        <h1 className="text-center font-bold text-base leading-tight text-gray-700">
          Hospital das<br />Clínicas UFPE
        </h1>
        <div className="flex items-center gap-3">
          <button title="Ajuda" className="text-blue-900 text-lg">❓</button>
          <button title="Perfil" className="text-blue-900 text-lg">👤</button>
          <button title="Configurações" className="text-blue-900 text-lg">⚙️</button>
          <button className="ml-2 text-sm px-3 py-1 border border-blue-900 rounded hover:bg-blue-900 hover:text-white transition">
            SAIR
          </button>
        </div>
      </header>
    );
  }
  