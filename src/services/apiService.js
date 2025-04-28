const API_URL = 'http://localhost:3001';

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

// AGENDAMENTOS
export const fetchAgendamentos = async () => {
  const res = await fetch(`${API_URL}/agendamentos`);
  if (!res.ok) throw new Error('Erro ao buscar agendamentos');
  return await res.json();
};

// RELATÓRIOS
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

export const updatePredio = async (id, predio) => {
  const res = await fetch(`${API_URL}/predios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(predio),
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

// 🏫 SALAS
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

export const updateSala = async (id, sala) => {
  const res = await fetch(`${API_URL}/salas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sala),
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

export const updateChave = async (id, chave) => {
  const res = await fetch(`${API_URL}/chaves/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chave),
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

// 🛠️ KITS
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

export const updateKit = async (id, kit) => {
  const res = await fetch(`${API_URL}/kits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kit),
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
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error('Erro ao criar usuário');
  return res.json();
};

export const updateUsuario = async (id, usuarioAtualizado) => {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuarioAtualizado),
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
