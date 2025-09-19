// src/pages/Agenda.jsx
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";

import { getAgenda, getAgendaByColaborador, getAgendaDefinicao } from "@/services/ENDPOINTS_ServiceAgenda";
import { fetchColaboradores } from "@/services/ENDPOINTS_ServiceColaboradores";


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
  const [definicoes, setDefinicoes] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resDefinicao = await getAgendaDefinicao();
        setDefinicoes(resDefinicao);
      } catch (err) {
        console.error("Erro ao carregar designações:", err);
      }
    }

    carregarDados();
  }, []);

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
            {definicoes.length === 0 ? (
              <tr>
                <td colSpan="5" className="agenda-col-vazio">
                  Nenhuma definição encontrada
                </td>
              </tr>
            ) : (
              definicoes.map((item, idx) => (
                <tr key={idx}>
                  <td className="agenda-col-tipo">{item.entity_type}</td>
                  <td className="agenda-col-descricao">{item.descricao}</td>
                  <td className="agenda-col-responsavel">
                    {item.responsavel?.nome || "—"}
                  </td>
                  <td className="agenda-col-numero">{item.entidade?.numero}</td>
                  <td className="agenda-col-acoes">
                    <div className="agenda-acoes-wrapper">
                      <select className="agenda-input agenda-select">
                        <option>Selecione</option>
                      </select>
                      <input
                        type="date"
                        className="agenda-input agenda-date"
                      />
                      <Button size="sm" className="tabela-acao-botao">
                        Salvar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function AgendaPessoal({ semanaOffset, setSemanaOffset }) {
  const diasSemana = getDiasSemana(semanaOffset);
  const [compromissos, setCompromissos] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    async function carregarDados() {
      try {
        if (!user?.id) return;
        const resAgenda = await getAgendaByColaborador(user.id);
        setCompromissos(resAgenda);
      } catch (err) {
        console.error("Erro ao carregar agenda pessoal:", err);
      }
    }

    carregarDados();
  }, [user]);

  const compromissosPorDia = useMemo(() => {
    const mapa = {};
    diasSemana.forEach((dia) => {
      const chave = dia.toISOString().split("T")[0];
      mapa[chave] = [];
    });

    compromissos.forEach((evento) => {
      const data = evento.data_definida?.split("T")[0];
      if (mapa[data]) {
        mapa[data].push(evento);
      }
    });

    return mapa;
  }, [diasSemana, compromissos]);

  return (
    <div className="agenda-section">
      <div className="agenda-grid-wrapper">
        <button
          className="agenda-arrow left"
          onClick={() => setSemanaOffset(semanaOffset - 1)}
        >
          ⬅️
        </button>

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
                    let eventos = compromissosPorDia[chave] || [];

                    if (eventos.length === 0) {
                      return (
                        <li className="agenda-item agenda-item-azul">
                          <span className="agenda-item-texto">🔵 Nenhum compromisso</span>
                        </li>
                      );
                    }

                    // ---- ORDENAR EVENTOS ----
                    eventos = [...eventos].sort((a, b) => {
                      const isAudA =
                        a.entity_type === "processo" &&
                        a.descricao?.toLowerCase().includes("audiencia");
                      const isAudB =
                        b.entity_type === "processo" &&
                        b.descricao?.toLowerCase().includes("audiencia");

                      if (isAudA && !isAudB) return -1;
                      if (!isAudA && isAudB) return 1;

                      if (isAudA && isAudB) {
                        const hA = a.horario ? new Date(a.horario).getTime() : 0;
                        const hB = b.horario ? new Date(b.horario).getTime() : 0;
                        return hA - hB;
                      }

                      if (a.status === "pendente" && b.status !== "pendente") return -1;
                      if (b.status === "pendente" && a.status !== "pendente") return 1;

                      if (a.status === "resolvido" && b.status !== "resolvido") return 1;
                      if (b.status === "resolvido" && a.status !== "resolvido") return -1;

                      return 0;
                    });

                    // ---- LIMITAR EXIBIÇÃO ----
                    const temMais = eventos.length > 8;
                    const eventosVisiveis = temMais ? eventos.slice(0, 7) : eventos;

                    return (
                      <>
                        {eventosVisiveis.map((evento, i) => {
                          let corClasse = "";
                          switch (evento.status) {
                            case "com_hora":
                              corClasse = "agenda-item-vermelho";
                              break;
                            case "resolvido":
                              corClasse = "agenda-item-verde";
                              break;
                            case "pendente":
                            default:
                              corClasse = "agenda-item-azul";
                              break;
                          }
                          

                          const horario =
                            evento.entity_type === "processo" &&
                            evento.descricao?.toLowerCase().includes("audiencia") &&
                            evento.horario
                              ? new Date(evento.horario).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : null;

                          return (
                            <li key={i} className={`agenda-item ${corClasse}`}>
                              <span className="agenda-item-texto">
                                {evento.entity_type} → {evento.descricao}
                                {horario ? ` ${horario}` : ""}
                              </span>
                              <div>{evento.responsavel?.nome || "—"}</div>
                            </li>
                          );
                        })}

                        {temMais && (
                          <li
                            className="agenda-item agenda-item-azul cursor-pointer"
                            onClick={() => {
                              setEventosExtras(eventos);
                              setMostrarModal(true);
                            }}
                          >
                            <span className="agenda-item-texto">+ Mais Atribuições</span>
                          </li>
                        )}
                      </>
                    );
                  })()}

                </ul>

            </div>
          ))}
        </div>

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






function AgendaEquipe({ semanaOffset, setSemanaOffset, responsavelFiltro }) {
  const diasSemana = getDiasSemana(semanaOffset);
  const [compromissos, setCompromissos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eventosExtras, setEventosExtras] = useState([]);

  useEffect(() => {
    async function carregarColaboradores() {
      try {
        const res = await fetchColaboradores();
        setColaboradores(res);
      } catch (err) {
        console.error("Erro ao carregar colaboradores:", err);
      }
    }
    carregarColaboradores();
  }, []);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resAgenda = await getAgenda();
        setCompromissos(resAgenda);
      } catch (err) {
        console.error("Erro ao carregar agenda da equipe:", err);
      }
    }
    carregarDados();
  }, []);

  const compromissosPorDia = useMemo(() => {
    const mapa = {};
    diasSemana.forEach((dia) => {
      const chave = dia.toISOString().split("T")[0];
      mapa[chave] = [];
    });

    compromissos.forEach((evento) => {
      const data = evento.data_definida?.split("T")[0];
      if (mapa[data]) {
        if (!responsavelFiltro || evento.responsavel?.id === Number(responsavelFiltro)) {
          mapa[data].push(evento);
        }
      }
    });

    return mapa;
  }, [diasSemana, compromissos, responsavelFiltro]);

  return (
    <div className="agenda-section">
      <div className="agenda-grid-wrapper">
        <button
          className="agenda-arrow left"
          onClick={() => setSemanaOffset(semanaOffset - 1)}
        >
          ⬅️
        </button>

        <div className="agenda-grid">
          {diasSemana.slice(0, 7).map((dia, idx) => (
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
                    let eventos = compromissosPorDia[chave] || [];

                    if (eventos.length === 0) {
                      return (
                        <li className="agenda-item agenda-item-azul">
                          <span className="agenda-item-texto">🔵 Nenhum compromisso</span>
                        </li>
                      );
                    }

                    // ---- ORDENAR EVENTOS ----
                    eventos = [...eventos].sort((a, b) => {
                      const isAudA =
                        a.entity_type === "processo" &&
                        a.descricao?.toLowerCase().includes("audiencia");
                      const isAudB =
                        b.entity_type === "processo" &&
                        b.descricao?.toLowerCase().includes("audiencia");

                      if (isAudA && !isAudB) return -1;
                      if (!isAudA && isAudB) return 1;

                      if (isAudA && isAudB) {
                        const hA = a.horario ? new Date(a.horario).getTime() : 0;
                        const hB = b.horario ? new Date(b.horario).getTime() : 0;
                        return hA - hB;
                      }

                      if (a.status === "pendente" && b.status !== "pendente") return -1;
                      if (b.status === "pendente" && a.status !== "pendente") return 1;

                      if (a.status === "resolvido" && b.status !== "resolvido") return 1;
                      if (b.status === "resolvido" && a.status !== "resolvido") return -1;

                      return 0;
                    });

                    // ---- LIMITAR EXIBIÇÃO ----
                    const temMais = eventos.length > 8;
                    const eventosVisiveis = temMais ? eventos.slice(0, 7) : eventos;

                    return (
                      <>
                        {eventosVisiveis.map((evento, i) => {
                          let corClasse = "";
                          switch (evento.status) {
                            case "com_hora":
                              corClasse = "agenda-item-vermelho";
                              break;
                            case "resolvido":
                              corClasse = "agenda-item-verde";
                              break;
                            case "pendente":
                            default:
                              corClasse = "agenda-item-azul";
                              break;
                          }
                          

                          const horario =
                            evento.entity_type === "processo" &&
                            evento.descricao?.toLowerCase().includes("audiencia") &&
                            evento.horario
                              ? new Date(evento.horario).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : null;

                          return (
                            <li key={i} className={`agenda-item ${corClasse}`}>
                              <span className="agenda-item-texto">
                                {evento.entity_type} → {evento.descricao}
                                {horario ? ` ${horario}` : ""}
                              </span>
                              <div>{evento.responsavel?.nome || "—"}</div>
                            </li>
                          );
                        })}

                        {temMais && (
                          <li
                            className="agenda-item agenda-item-azul cursor-pointer"
                            onClick={() => {
                              setEventosExtras(eventos);
                              setMostrarModal(true);
                            }}
                          >
                            <span className="agenda-item-texto">+ Mais Atribuições</span>
                          </li>
                        )}
                      </>
                    );
                  })()}

                </ul>

            </div>
          ))}

          {/* Card extra */}
          {diasSemana.length > 7 && (
            <div
              className="agenda-card agenda-card-extra"
              onClick={() => {
                const extras = diasSemana.slice(7).map((dia) => {
                  const chave = dia.toISOString().split("T")[0];
                  return compromissosPorDia[chave] || [];
                }).flat();
                setEventosExtras(extras);
                setMostrarModal(true);
              }}
            >
              <h3 className="agenda-card-title">+ Mais</h3>
              <p className="agenda-item-texto">Clique para ver atribuições extras</p>
            </div>
          )}
        </div>

        <button
          className="agenda-arrow right"
          onClick={() => setSemanaOffset(semanaOffset + 1)}
        >
          ➡️
        </button>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="agenda-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="agenda-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="agenda-modal-title">Atribuições Extras</h3>
            <ul className="agenda-modal-lista">
              {eventosExtras.map((evento, idx) => (
                <li key={idx} className="agenda-item agenda-item-azul">
                  <span className="agenda-item-texto">
                    {evento.entity_type} → {evento.descricao}
                  </span>
                  <div>{evento.responsavel?.nome || "—"}</div>
                </li>
              ))}
            </ul>
            <button
              className="agenda-modal-fechar"
              onClick={() => setMostrarModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





// src/pages/Agenda.jsx
export default function Agenda() {
  const [abaAtiva, setAbaAtiva] = useState("pessoal");
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [colaboradores, setColaboradores] = useState([]);
  const [responsavelFiltro, setResponsavelFiltro] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    async function carregarColaboradores() {
      try {
        const res = await fetchColaboradores();
        setColaboradores(res);
      } catch (err) {
        console.error("Erro ao carregar colaboradores:", err);
      }
    }
    carregarColaboradores();
  }, []);

  const tituloAba = {
    pessoal: "👤 Minha Agenda",
    equipe: "👥 Agenda da Equipe",
    designacao: "📋 Designação de Atribuições",
  };

  return (
    <div className="agenda-main-wrapper">
      <h3 className="agenda-heading">{tituloAba[abaAtiva]}</h3>

      {/* Cabeçalho com tabs e filtro */}
      <div className="agenda-main-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Botões de navegação */}
        <div className="agenda-tabs">
          <Button
            variant={abaAtiva === "pessoal" ? "default" : "outline"}
            className="agenda-tabs-btn"
            onClick={() => setAbaAtiva("pessoal")}
          >
            👤 Minha Agenda
          </Button>
          <Button
            variant={abaAtiva === "equipe" ? "default" : "outline"}
            className="agenda-tabs-btn"
            onClick={() => setAbaAtiva("equipe")}
          >
            👥 Agenda da Equipe
          </Button>
          <Button
            variant={abaAtiva === "designacao" ? "default" : "outline"}
            className="agenda-tabs-btn"
            onClick={() => setAbaAtiva("designacao")}
          >
            📋 Designação
          </Button>
          {/* Filtro aparece só na aba equipe */}
          {abaAtiva === "equipe" && (
            <select
              value={responsavelFiltro}
              onChange={(e) => setResponsavelFiltro(e.target.value)}
              className="agenda-select"
            >
              <option value="">Todos os responsáveis</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.id}>
                  {colab.nome}
                </option>
              ))}
            </select>
          )}
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
          responsavelFiltro={responsavelFiltro} // passa filtro como prop
        />
      )}
      {abaAtiva === "designacao" && <AgendaDesignacao />}
    </div>
  );
}


