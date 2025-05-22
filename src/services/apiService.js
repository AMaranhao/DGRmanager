const API_URL = 'http://localhost:3001';
import { normalizeUsuarioData } from './helpers';


 // ------------------------
// EMPRESTIMOS
 // ------------------------

export const fetchEmprestimos = async () => {
  const res = await fetch(`${API_URL}/emprestimos`);
  if (!res.ok) throw new Error('Erro ao buscar empréstimos');
  return await res.json();
};

export const retirarChave = async (dados) => {
  const res = await fetch(`${API_URL}/emprestimos/retirar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao retirar chave');
  return await res.json();
};

export const devolverChave = async (dados) => {
  const res = await fetch(`${API_URL}/emprestimos/devolver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao devolver chave');
  return await res.json();
};

export async function createEmprestimo(dados) {
  const body = {
    usuarioCPF: dados.cpf,
    salaId: dados.salaId,
    agendamentoId: dados.agendamentoId || null,
    horario_recepcao: dados.horario_recepcao,
    horario_esperado_devolucao: dados.horario_esperado_devolucao,
    kitId: dados.kitId || null
  };

  //console.log("📦 Corpo da requisição POST /emprestimos:", body);


  const response = await fetch(`${API_URL}/emprestimos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Erro ao criar empréstimo");
  }

  return await response.json();
}


export async function updateEmprestimo(id, dados) {
  const payload = {
    horario_devolucao: dados.horario_devolucao,
  };

  const response = await fetch(`${API_URL}/emprestimos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erro ao atualizar empréstimo");
  return response.json();
}




// ------------------------
// AGENDAMENTOS
// ------------------------

export const fetchAgendamentosEmprestimos = async () => {
  const res = await fetch(`${API_URL}/agendamentos_emprestimos`);
  if (!res.ok) throw new Error('Erro ao buscar agendamentos');
  return await res.json();
};

export const fetchAgendamentos = async () => {
  const res = await fetch(`${API_URL}/agendamentos`);
  if (!res.ok) throw new Error('Erro ao buscar agendamentos');
  return await res.json();
};

// Criar agendamento
export const createAgendamento = async (agendamento) => {
  const res = await fetch(`${API_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agendamento),
  });
  if (!res.ok) throw new Error('Erro ao criar agendamento');
  return await res.json();
};

// Atualizar agendamento
export const updateAgendamento = async (id, dadosAtualizados) => {
  const payload = Object.fromEntries(
    Object.entries(dadosAtualizados).filter(
      ([_, valor]) =>
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== "string" || valor.trim() !== "")
    )
  );

  const res = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao atualizar agendamento');
  return res.json();
};

// Deletar agendamento
export const deleteAgendamento = async (id) => {
  const res = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar agendamento');
};


// ------------------------
// RELATÓRIOS
// ------------------------

export const fetchRelatorioUsoSalas = async () => {
  const res = await fetch(`${API_URL}/relatorios/uso-salas`);
  if (!res.ok) throw new Error('Erro ao buscar relatório de uso de salas');
  return await res.json();
};
 
// ------------------------
// 🏢 PRÉDIOS
// ------------------------

export const fetchPredios = async () => {
  const res = await fetch(`${API_URL}/predios`);
  if (!res.ok) throw new Error('Erro ao buscar prédios');
  return res.json();
};

export const createPredio = async (predio) => {
  const res = await fetch(`${API_URL}/predios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(predio),
  });
  if (!res.ok) throw new Error('Erro ao criar prédio');
  return res.json();
};

export const updatePredio = async (id, dadosAtualizados) => {
  const payload = Object.fromEntries(
    Object.entries(dadosAtualizados).filter(
      ([_, valor]) =>
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== "string" || valor.trim() !== "")
    )
  );

  const res = await fetch(`${API_URL}/predios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao atualizar prédio');
  return res.json();
};


export const deletePredio = async (id) => {
  const res = await fetch(`${API_URL}/predios/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar prédio');
};

// ------------------------
// 🏫 ANDARES
// ------------------------


export const fetchAndaresPorPredio = async (predioId) => {
  const res = await fetch(`${API_URL}/andares?predioId=${predioId}`);
  if (!res.ok) throw new Error('Erro ao buscar andares por prédio');
  return await res.json();
};

export const fetchAndares = async () => {
  const res = await fetch(`${API_URL}/andares`);
  if (!res.ok) throw new Error('Erro ao buscar andares');
  return res.json();
};


// ------------------------
// 🏫 SALAS
// ------------------------

export const fetchSalas = async () => {
  const res = await fetch(`${API_URL}/salas`);
  if (!res.ok) throw new Error('Erro ao buscar salas');
  return res.json();
};

export const createSala = async (sala) => {
  const res = await fetch(`${API_URL}/salas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sala),
  });
  if (!res.ok) throw new Error('Erro ao criar sala');
  return res.json();
};

export const updateSala = async (id, dadosAtualizados) => {
  const payload = Object.fromEntries(
    Object.entries(dadosAtualizados).filter(
      ([_, valor]) =>
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== "string" || valor.trim() !== "")
    )
  );

  const res = await fetch(`${API_URL}/salas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao atualizar sala');
  return res.json();
};


export const deleteSala = async (id) => {
  const res = await fetch(`${API_URL}/salas/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar sala');
};

export const fetchTiposSala = async () => {
  const res = await fetch(`${API_URL}/tiposala`);
  if (!res.ok) throw new Error('Erro ao buscar tipos de sala');
  return res.json();
};


// ------------------------
// 🔑 CHAVES
// ------------------------

export const fetchChaves = async () => {
  const res = await fetch(`${API_URL}/chaves`);
  if (!res.ok) throw new Error('Erro ao buscar chaves');
  return res.json();
};

export const createChave = async (chave) => {
  const res = await fetch(`${API_URL}/chaves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chave),
  });
  if (!res.ok) throw new Error('Erro ao criar chave');
  return res.json();
};

export const updateChave = async (id, dadosAtualizados) => {
  const payload = Object.fromEntries(
    Object.entries(dadosAtualizados).filter(
      ([_, valor]) =>
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== "string" || valor.trim() !== "")
    )
  );

  const res = await fetch(`${API_URL}/chaves/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao atualizar chave');
  return res.json();
};


export const deleteChave = async (id) => {
  const res = await fetch(`${API_URL}/chaves/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar chave');
};

// ------------------------
// 🛠️ KITS
// ------------------------

export const fetchKits = async () => {
  const res = await fetch(`${API_URL}/kits`);
  if (!res.ok) throw new Error('Erro ao buscar kits');
  return res.json();
};

export const createKit = async (kit) => {
  const res = await fetch(`${API_URL}/kits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kit),
  });
  if (!res.ok) throw new Error('Erro ao criar kit');
  return res.json();
};

export const updateKit = async (id, dadosAtualizados) => {
  const payload = Object.fromEntries(
    Object.entries(dadosAtualizados).filter(
      ([_, valor]) =>
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== "string" || valor.trim() !== "")
    )
  );

  const res = await fetch(`${API_URL}/kits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao atualizar kit');
  return res.json();
};


export const deleteKit = async (id) => {
  const res = await fetch(`${API_URL}/kits/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar kit');
};

// ------------------------
// 👤 USUÁRIOS
// ------------------------

export const fetchUsuarios = async () => {
  const res = await fetch(`${API_URL}/usuarios`);
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  return res.json();
};

export const criarUsuario = async (usuario) => {
  const payload = normalizeUsuarioData(usuario);

  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao criar usuário');
  return res.json();
};


export const updateUsuario = async (id, dadosAtualizados) => {
  const normalizados = normalizeUsuarioData(dadosAtualizados);

  const payload = Object.fromEntries(
    Object.entries(normalizados).filter(
      ([_, valor]) =>
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== 'string' || valor.trim() !== '')
    )
  );

  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao atualizar usuário');
  return res.json();
};



export const desativarUsuario = async (id, novoStatusAtivo) => {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ativo: novoStatusAtivo }),
  });
  if (!res.ok) throw new Error('Erro ao alterar status do usuário');
  return res.json();
};

export const updateUsuarioSenha = async (id, novaSenha) => {
  const res = await fetch(`${API_URL}/usuarios/${id}/senha`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha: novaSenha }),
  });

  if (!res.ok) throw new Error('Erro ao atualizar senha do usuário');
  return res.json();
};

export const updateUsuarioSenhaAssinatura = async (id, novaSenhaAssinatura) => {
  const res = await fetch(`${API_URL}/usuarios/${id}/senha-assinatura`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senhaassassinatura: novaSenhaAssinatura }),
  });

  if (!res.ok) throw new Error('Erro ao atualizar senha de assinatura');
  return res.json();
};

export const updateUsuarioAtivo = async (id, novoStatusAtivo) => {
  const res = await fetch(`${API_URL}/usuarios/${id}/estaativo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ esta_ativo: novoStatusAtivo }),
  });
  if (!res.ok) throw new Error('Erro ao alterar status do usuário');
  return res.json();
};




// ------------------------
// 👤 USUÁRIO LOGADO
// ------------------------

export const fetchUsuarioLogado = async () => {
  const res = await fetch(`${API_URL}/me`);
  if (!res.ok) throw new Error('Erro ao buscar usuário logado');
  return res.json();
};


export async function validarSenhaAssinatura(cpf, senha) {
  const resposta = await fetch(`${API_URL}/senhaassinatura`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, senha_assinatura: senha })  // <- ESSA LINHA É CRUCIAL
  });

  return resposta;
}


// ------------------------
// 👤 CURSO E CARGO
// ------------------------

export const fetchCargos = async () => {
  const res = await fetch(`${API_URL}/cargos`);
  if (!res.ok) throw new Error('Erro ao buscar cargos');
  return res.json();
};


export const fetchCursos = async () => {
  const res = await fetch(`${API_URL}/cursos`);
  if (!res.ok) throw new Error('Erro ao buscar cursos');
  return res.json();
};