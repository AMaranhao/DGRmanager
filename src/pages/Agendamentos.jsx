import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { fetchAgendamentos, fetchSalas } from "@/services/apiService";
import { X, } from 'lucide-react';

import "@/styles/pages/agendamentos.css";
import '@/styles/pages/filters.css';
import '@/styles/pages/modals.css';
import '@/styles/pages/buttons.css';
import '@/styles/pages/status.css';
import '@/styles/mobile.css';

export default function Agendamentos() {
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipoSalaFiltro, setTipoSalaFiltro] = useState("");
  const [andarFiltro, setAndarFiltro] = useState("");
  const [salas, setSalas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [todasSalas, setTodasSalas] = useState([]);


  const horarios = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  useEffect(() => {
    carregarSalas();
    carregarAgendamentos();
  }, [dataSelecionada, tipoSalaFiltro, andarFiltro]);

  const carregarSalas = async () => {
    const todas = await fetchSalas();
    setTodasSalas(todas); // para os filtros
    const filtradas = todas.filter(sala =>
      (!tipoSalaFiltro || sala.tipo?.tipo_sala === tipoSalaFiltro) &&
      (!andarFiltro || String(sala.andar?.id) === String(andarFiltro))
    );
    setSalas(filtradas);
  };
  
  

  const carregarAgendamentos = async () => {
    const dados = await fetchAgendamentos();
    const filtrados = dados.filter(ag =>
      ag.horario_inicio?.startsWith(dataSelecionada)
    );
    setAgendamentos(filtrados);
  };

  const verificarOcupado = (salaId, horario) => {
    return agendamentos.some(ag =>
      ag.sala?.id === salaId &&
      ag.horario_inicio.slice(11, 16) === horario
    );
  };

  return (
    <div className="agendamentos-wrapper">
      <h3 className="dashboard-heading">Grade de Agendamentos</h3>

      {/* Filtros */}
      <div className="dashboard-filtro">
            <Input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="dashboard-select dashboard-filtro-usuario-input"
            />

            {/* Filtro Andar */}
            <div className="dashboard-filtro-group dashboard-filtro-text">
                <select
                    value={andarFiltro}
                    onChange={(e) => setAndarFiltro(e.target.value)}
                    className="dashboard-select"
                    >
                    <option value="">Todos os Andares</option>
                    {[...new Map(todasSalas.map(s => [s.andar?.id, s.andar?.nome]))
                        .entries()]
                        .filter(([id, nome]) => id && nome)
                        .map(([id, nome]) => (
                        <option key={`andar-${id}`} value={id}>Andar {nome}</option>
                    ))}
                </select>
                {andarFiltro && (
                <button
                    type="button"
                    onClick={() => setAndarFiltro("")}
                    className="dashboard-filtro-clear"
                    title="Limpar"
                >
                    <X size={14} />
                </button>
                )}
            </div>

            {/* Filtro Tipo Sala */}
            <div className="dashboard-filtro-group dashboard-filtro-text">
                <select
                    value={tipoSalaFiltro}
                    onChange={(e) => setTipoSalaFiltro(e.target.value)}
                    className="dashboard-select"
                    >
                    <option value="">Tipos de Sala</option>
                    {[...new Set(todasSalas.map(s => s.tipo?.tipo_sala).filter(Boolean))].map((tipo) => (
                        <option key={`tipo-${tipo}`} value={tipo}>{tipo}</option>
                    ))}
                </select>
                {tipoSalaFiltro && (
                <button
                    type="button"
                    onClick={() => setTipoSalaFiltro("")}
                    className="dashboard-filtro-clear"
                    title="Limpar"
                >
                    <X size={14} />
                </button>
                )}
            </div>
        </div>


      {/* Grade de Agendamentos */}
      <div className="grade-agendamentos">
        <div className="linha-header">
          <div className="celula-hora">Horário</div>
          {salas.map(sala => (
            <div key={`coluna-${sala.id}`} className="celula-sala">{sala.numero}</div>
          ))}
        </div>

        {horarios.map(hora => (
          <div key={`linha-${hora}`} className="linha-horario">
            <div className="celula-hora">{hora}</div>
            {salas.map(sala => (
              <div
                key={`celula-${sala.id}-${hora}`}
                className={`celula-sala ${verificarOcupado(sala.id, hora) ? "ocupado" : "livre"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
