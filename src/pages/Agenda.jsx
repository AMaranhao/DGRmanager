// src/pages/Agenda.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

import "@/styles/unified_refactored_styles.css";


// Função utilitária para calcular os dias úteis da semana atual
function getDiasSemana() {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda ...
  const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const segunda = new Date(hoje.setDate(diffSegunda));

  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}


function AgendaDesignacao() {
  return (
    <div className="agenda-section">
      <div className="agenda-tabela-wrapper">
        <table className="agenda-tabela">
          <thead>
            <tr>
              <th className="agenda-col-tipo">Tipo</th>
              <th className="agenda-col-descricao">Descrição</th>
              <th className="agenda-col-responsavel">Responsável</th>
              <th className="agenda-col-numero">Número</th>
              <th className="agenda-col-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="agenda-col-tipo">processo</td>
              <td className="agenda-col-descricao">Audiência</td>
              <td className="agenda-col-responsavel">—</td>
              <td className="agenda-col-numero">08111-89.2025.8.17.0001</td>
              <td className="agenda-col-acoes">
                <div className="agenda-acoes-wrapper">
                  <select className="agenda-input agenda-select">
                    <option>Selecione</option>
                  </select>
                  <input type="date" className="agenda-input agenda-date" />
                  <Button size="sm" className="tabela-acao-botao">Salvar</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


function AgendaPessoal() {
  const diasSemana = getDiasSemana();

  return (
    <div className="agenda-section">
      <div className="agenda-grid">
        {diasSemana.map((dia, idx) => (
          <div key={idx} className="agenda-card">
            <h3 className="agenda-card-title">
              {dia.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}
            </h3>
            <ul className="agenda-lista">
              <li className="agenda-item agenda-item-azul">
                <p className="agenda-item-text">🔵 Nenhum compromisso</p>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}




function AgendaEquipe() {
  const diasSemana = getDiasSemana();

  return (
    <div className="agenda-section">
      <div className="agenda-grid">
        {diasSemana.map((dia, idx) => (
          <div key={idx} className="agenda-card">
            <h3 className="agenda-card-title">
              {dia.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}
            </h3>
            <ul className="agenda-lista">
              <li className="agenda-item agenda-item-azul">
                <p className="agenda-item-text">🔵 Nenhum compromisso</p>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}



export default function Agenda() {
  const [abaAtiva, setAbaAtiva] = useState("pessoal"); // pessoal | equipe | designacao

  const tituloAba = {
    pessoal: "👤 Minha Agenda",
    equipe: "👥 Agenda da Equipe",
    designacao: "📋 Designação de Atribuições",
  };

  return (
    <div className="agenda-main-wrapper">
      {/* Cabeçalho principal */}
      <h3 className="agenda-heading">{tituloAba[abaAtiva]}</h3>

      {/* Tabs alinhadas à direita */}
      <div className="agenda-main-header">
        <Button
          variant={abaAtiva === "pessoal" ? "default" : "outline"}
          onClick={() => setAbaAtiva("pessoal")}
        >
          👤 Minha Agenda
        </Button>
        <Button
          variant={abaAtiva === "equipe" ? "default" : "outline"}
          onClick={() => setAbaAtiva("equipe")}
        >
          👥 Agenda da Equipe
        </Button>
        <Button
          variant={abaAtiva === "designacao" ? "default" : "outline"}
          onClick={() => setAbaAtiva("designacao")}
        >
          📋 Designação
        </Button>
      </div>

      {/* Renderização condicional */}
      {abaAtiva === "pessoal" && <AgendaPessoal />}
      {abaAtiva === "equipe" && <AgendaEquipe />}
      {abaAtiva === "designacao" && <AgendaDesignacao />}
    </div>
  );
}

