// src/pages/Agenda.jsx
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";


import { getAgenda, getAgendaDefinicao } from "@/services/ENDPOINTS_ServiceAgenda";

import "@/styles/unified_refactored_styles.css";


// Função utilitária para calcular os dias úteis da semana atual
function getDiasSemana(offset = 0) {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda ...
  const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const segunda = new Date(hoje.setDate(diffSegunda));

  // aplica deslocamento de semanas
  segunda.setDate(segunda.getDate() + offset * 7);

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


function AgendaPessoal({ semanaOffset, setSemanaOffset }) {
  const diasSemana = getDiasSemana(semanaOffset);
  const [compromissos, setCompromissos] = useState([]);
  const [definicoes, setDefinicoes] = useState({});

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAgenda, resDefinicao] = await Promise.all([
          getAgenda(),
          getAgendaDefinicao()
        ]);

        setCompromissos(resAgenda);         // lista de compromissos
        setDefinicoes(resDefinicao);        // ex: tipos, status, cores etc

      } catch (err) {
        console.error("Erro ao carregar agenda:", err);
      }
    }

    carregarDados();
  }, []);

  const compromissosPorDia = useMemo(() => {
    const mapa = {};

    diasSemana.forEach((dia) => {
      const chave = dia.toISOString().split("T")[0]; // yyyy-mm-dd
      mapa[chave] = [];
    });

    compromissos.forEach((evento) => {
      const data = evento.data?.split("T")[0];
      if (mapa[data]) {
        mapa[data].push(evento);
      }
    });

    return mapa;
  }, [diasSemana, compromissos]);


  return (
    <div className="agenda-section">
      <div className="agenda-grid-wrapper">
        {/* Botão Esquerda */}
        <button
          className="agenda-arrow left"
          onClick={() => setSemanaOffset(semanaOffset - 1)}
        >
          ⬅️
        </button>

        {/* Grid de Dias */}
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
                  {(() => {
                    const chave = dia.toISOString().split("T")[0];
                    const eventos = compromissosPorDia[chave] || [];

                    if (eventos.length === 0) {
                      return (
                        <li className="agenda-item agenda-item-azul">
                          <p className="agenda-item-text">🔵 Nenhum compromisso</p>
                        </li>
                      );
                    }

                    return eventos.map((evento, i) => {
                      const tipo = evento.tipo || "default";
                      const corClasse =
                        tipo === "audiencia"
                          ? "agenda-item-vermelho"
                          : tipo === "atribuição"
                          ? "agenda-item-azul"
                          : "agenda-item-verde"; // ajuste conforme sua definição

                      return (
                        <li key={i} className={`agenda-item ${corClasse}`}>
                          <p className="agenda-item-text">
                            {evento.icone || "🔹"} {evento.titulo || evento.descricao}
                          </p>
                          {evento.responsavel && (
                            <p className="agenda-item-meta">Resp.: {evento.responsavel}</p>
                          )}
                        </li>
                      );
                    });
                  })()}
                </ul>

            </div>
          ))}
        </div>

        {/* Botão Direita */}
        <button
          className="agenda-arrow right"
          onClick={() => setSemanaOffset(semanaOffset + 1)}
        >
          ➡️
        </button>
      </div>

    </div>
  );
}




function AgendaEquipe({ semanaOffset, setSemanaOffset }) {
  const diasSemana = getDiasSemana(semanaOffset);

  return (
    <div className="agenda-section">
      <div className="agenda-grid-wrapper">
        {/* Botão Esquerda */}
        <button
          className="agenda-arrow left"
          onClick={() => setSemanaOffset(semanaOffset - 1)}
        >
          ⬅️
        </button>

        {/* Grid de Dias */}
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

        {/* Botão Direita */}
        <button
          className="agenda-arrow right"
          onClick={() => setSemanaOffset(semanaOffset + 1)}
        >
          ➡️
        </button>
      </div>


    </div>
  );
}



export default function Agenda() {
  const [abaAtiva, setAbaAtiva] = useState("pessoal");
  const [semanaOffset, setSemanaOffset] = useState(0);

  const tituloAba = {
    pessoal: "👤 Minha Agenda",
    equipe: "👥 Agenda da Equipe",
    designacao: "📋 Designação de Atribuições",
  };

  return (
    <div className="agenda-main-wrapper">
      <h3 className="agenda-heading">{tituloAba[abaAtiva]}</h3>

      {/* Cabeçalho com navegação e tabs */}
      <div className="agenda-main-header">
        <div className="agenda-tabs">
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
      </div>


      {/* Renderização condicional */}
      {abaAtiva === "pessoal" && (
        <AgendaPessoal
          semanaOffset={semanaOffset}
          setSemanaOffset={setSemanaOffset}
        />
      )}
      {abaAtiva === "equipe" && (
        <AgendaEquipe
          semanaOffset={semanaOffset}
          setSemanaOffset={setSemanaOffset}
        />
      )}

      {abaAtiva === "designacao" && <AgendaDesignacao />}
    </div>
  );
}


