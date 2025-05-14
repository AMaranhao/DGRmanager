export function normalizeUsuarioData(dados) {
    const dadosTratados = { ...dados };
  
    if (dadosTratados.cpf) {
      dadosTratados.cpf = dadosTratados.cpf.replace(/\D/g, "");
    }
  
    if (dadosTratados.curso) {
      dadosTratados.curso = { id: Number(dadosTratados.curso) };
    }
  
    if (dadosTratados.cargo) {
      dadosTratados.cargo = { id: Number(dadosTratados.cargo) };
    }
  
    const incluirAtivo = 'ativo' in dadosTratados;
  
    const payload = Object.fromEntries(
      Object.entries(dadosTratados).filter(
        ([chave, valor]) =>
          incluirAtivo && chave === 'ativo'
            ? true
            : valor !== null &&
              valor !== undefined &&
              (typeof valor !== "string" || valor.trim() !== "")
      )
    );
  
    return payload;
  }