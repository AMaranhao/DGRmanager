import { useEffect, useState } from "react";
import { validarSenhaAssinatura, updateEmprestimo, fetchEmprestimos } from "../services/apiService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


import "@/styles/pages/emprestimos.css";
import "@/styles/pages/filters.css";
import "@/styles/pages/tables.css";
import "@/styles/pages/modals.css";
import "@/styles/pages/buttons.css";
import "@/styles/pages/status.css";
import '@/styles/mobile.css';

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [dataInicial, setDataInicial] = useState(primeiroDia.toISOString().slice(0, 10));
  const [dataFinal, setDataFinal] = useState(ultimoDia.toISOString().slice(0, 10));



  const carregarEmprestimos = async () => {
    const dados = await fetchEmprestimos();
    setEmprestimos(dados);
  };
  
  useEffect(() => {
    carregarEmprestimos();
  }, []);
  
    

  const abrirModalConfirmacao = (emprestimo) => {
    setEmprestimoSelecionado(emprestimo);
    setModalConfirmacao(true);
  };
  
  const calcularTempoAtraso = (horarioEsperado) => {
    const fim = new Date();
    const esperado = new Date(horarioEsperado);
    const diffMs = fim - esperado;
  
    if (diffMs <= 0) return 'Nenhum';
  
    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const minRest = minutos % 60;
  
    return `${horas}h ${minRest}min`;
  };
  

  const emprestimosFiltrados = emprestimos.filter((e) => {
    const atendeStatus = statusFiltro ? e.status === statusFiltro : true;
  
    const dataRetirada = e.horario_retirada ? new Date(e.horario_retirada) : null;
    const dataFormatada = dataRetirada?.toISOString().slice(0, 10) ?? "";
  
    let inicio = dataInicial ? new Date(dataInicial) : null;
    let fim = dataFinal ? new Date(dataFinal) : null;
    if (inicio && fim && inicio > fim) [inicio, fim] = [fim, inicio];
  
    const atendeDataInicial = inicio ? dataFormatada >= inicio.toISOString().slice(0, 10) : true;
    const atendeDataFinal = fim ? dataFormatada <= fim.toISOString().slice(0, 10) : true;
  
    const nomeUsuario = `${e.usuario?.firstName || ""} ${e.usuario?.lastName || ""}`.toLowerCase();
    const numeroSala = e.chave?.sala?.numero?.toLowerCase() || "";
  
    const atendeTexto = textoPesquisa
      ? nomeUsuario.includes(textoPesquisa.toLowerCase()) || numeroSala.includes(textoPesquisa.toLowerCase())
      : true;
  
    return atendeStatus && atendeDataInicial && atendeDataFinal && atendeTexto;
  });
  

  return (
    <div className="dashboard-wrapper">
      <h3 className="dashboard-heading">Histórico de Empréstimos</h3>

      {/* Filtros */}
      <div className="dashboard-filtro">
        <div className="dashboard-filtro-group dashboard-filtro-text">
        <label className="relatorio-label">De:</label>
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataInicial && (
            <button
              type="button"
              onClick={() => setDataInicial("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-group dashboard-filtro-text">
        <label className="relatorio-label">Até:</label>
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {dataFinal && (
            <button
              type="button"
              onClick={() => setDataFinal("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-group dashboard-filtro-text">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="dashboard-select"
          >
            <option value="">Todos os Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Em atraso">Em atraso</option>
          </select>
          {statusFiltro && (
            <button
              type="button"
              onClick={() => setStatusFiltro("")}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dashboard-filtro-group dashboard-filtro-text">
          <input
            type="text"
            placeholder="Usuário ou Sala"
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
            className="dashboard-select dashboard-filtro-usuario-input"
          />
          {textoPesquisa && (
            <button
              onClick={() => setTextoPesquisa('')}
              className="dashboard-filtro-clear"
              title="Limpar"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="emprestimos-tabela-wrapper">
        <table className="emprestimos-tabela">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Usuário</th>
              <th>Status</th>
              <th>Horário Retirada</th>
              <th>Horário Devolução</th>
              <th>Tempo de Atraso</th>
            </tr>
          </thead>
          <tbody>
            {emprestimosFiltrados.map((e) => (
              <tr key={e.id}>
                <td>{e.chave?.sala?.numero || "-"}</td>
                <td>{`${e.usuario?.firstName || ""} ${e.usuario?.lastName || ""}`.trim() || "-"}</td>
                <td>
                  {e.status === 'Em atraso' ? (
                    <div className="status-com-acao">
                      <span className="status-atraso">{e.status}</span>
                      <button
                        className="btn-devolver"
                        onClick={() => abrirModalConfirmacao(e)}
                      >
                        Devolver
                      </button>
                    </div>
                  ) : (
                    <span className={
                      e.status === 'Em andamento'
                        ? 'status-andamento'
                        : 'status-finalizado'
                    }>
                      {e.status}
                    </span>
                  )}
                </td>
                <td>{new Date(e.horario_retirada).toLocaleString()}</td>
                <td>{e.horario_devolucao ? new Date(e.horario_devolucao).toLocaleString() : '-'}</td>
                <td>
                  {(() => {
                    const esperado = new Date(e.horario_esperado_devolucao);
                    let atraso = null;

                    if (e.status === "Finalizado" && e.horario_devolucao) {
                      const devolucao = new Date(e.horario_devolucao);
                      atraso = devolucao - esperado;
                    } else if (e.status === "Em atraso") {
                      atraso = new Date() - esperado;
                    }

                    if (atraso && atraso > 0) {
                      const horas = Math.floor(atraso / (1000 * 60 * 60));
                      const minutos = Math.floor((atraso % (1000 * 60 * 60)) / (1000 * 60));
                      return `${horas}h ${minutos}min`;
                    }

                    return "-";
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Modal de confirmação de devolução atrasada */}
       {modalConfirmacao && (
        <Dialog open={modalConfirmacao} onOpenChange={setModalConfirmacao}>
          <DialogOverlay className="dialog-overlay" />
          <DialogContent className="dashboard-modal dashboard-no-close">
            <DialogTitle>Confirmar Devolução Atrasada</DialogTitle>
            <DialogDescription className="usuarios-modal-descricao">
              Verifique as informações do empréstimo:
            </DialogDescription>
            <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

            <div className="modal-linhas">
              <p><strong>Sala:</strong> {emprestimoSelecionado?.chave?.sala?.numero || '-'}</p>
              <p><strong>Usuário:</strong> {`${emprestimoSelecionado?.usuario?.firstName || ''} ${emprestimoSelecionado?.usuario?.lastName || ''}`}</p>
              <p><strong>Tempo de Atraso:</strong> {calcularTempoAtraso(emprestimoSelecionado?.horario_esperado_devolucao)}</p>
            </div>


            <div className="usuarios-modal-actions mt-4">
              <Button variant="outline" onClick={() => setModalConfirmacao(false)}>Cancelar</Button>
              <Button onClick={() => {
                  setModalConfirmacao(false);
                  setErroSenha(false);
                  setSenha('');
                  setModalSenhaAberto(true);
                }}>
                  Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

          {/* Modal de senha para finalizar devolução */}
          {modalSenhaAberto && (
            <Dialog open={modalSenhaAberto} onOpenChange={setModalSenhaAberto}>
              <DialogOverlay className="dialog-overlay" />
              <DialogContent className="dashboard-modal dashboard-no-close">
                <DialogTitle>Digite a Senha</DialogTitle>
                <DialogDescription>Insira a senha de 4 dígitos para confirmar a devolução.</DialogDescription>
                <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>

                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    maxLength={4}
                    placeholder="Senha de 4 dígitos"
                    className="dashboard-modal-input"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        if (senha.length !== 4) {
                          setErroSenha(true);
                          return;
                        }

                        try {
                          const resposta = await validarSenhaAssinatura(emprestimoSelecionado.usuario.cpf, senha);
                          if (resposta.status !== 200 && resposta.status !== 201) {
                            setErroSenha(true);
                            return;
                          }

                          await updateEmprestimo(emprestimoSelecionado.id, {
                            horario_devolucao: new Date().toISOString(),
                          });

                          setMensagemSucesso('Devolução registrada com sucesso!');
                          setErroSenha(false);
                          setModalSenhaAberto(false); // Fecha o modal de senha imediatamente
                          setSenha('');

                          setTimeout(() => {
                            setMensagemSucesso('');
                            carregarEmprestimos(); // opcional: recarrega lista após sucesso
                          }, 2000);

                        } catch (error) {
                          console.error('Erro ao registrar devolução:', error);
                          setErroSenha(true);
                        }
                      }
                    }}
                  />
              </DialogContent>
            </Dialog>
        )}  
          <Dialog open={mensagemSucesso !== ''} onOpenChange={(open) => {
              if (!open) setMensagemSucesso('');
            }}>
              <DialogOverlay className="dialog-overlay" />
              <DialogContent className="dashboard-modal dashboard-no-close">
                <DialogTitle>Devolução Confirmada</DialogTitle>
                <DialogDescription className="usuarios-modal-descricao dashboard-modal-success-message">
                  <style>{`button.absolute.top-4.right-4 { display: none !important; }`}</style>
                  {mensagemSucesso}
                </DialogDescription>
              </DialogContent>
          </Dialog>
    </div>

    
  );
}
