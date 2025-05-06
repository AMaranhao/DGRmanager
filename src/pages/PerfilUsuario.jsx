import { useEffect, useState } from 'react';
import { fetchUsuarioLogado } from '../services/apiService';
import '@/styles/pages/perfilUsuario.css';


export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [novaSenhaAssinatura, setNovaSenhaAssinatura] = useState('');

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const dados = await fetchUsuarioLogado();
        setUsuario(dados);
      } catch (erro) {
        console.error('Erro ao carregar perfil:', erro);
      }
    };
    carregarUsuario();
  }, []);

  const handleAlterarSenha = () => {
    console.log('Nova senha:', novaSenha);
  };

  const handleAlterarSenhaAssinatura = () => {
    console.log('Nova senha de assinatura:', novaSenhaAssinatura);
  };

  if (!usuario) return <div>Carregando perfil...</div>;

  return (
    <div className="perfil-container">
      <h2 className="perfil-titulo">Perfil do Usuário</h2>

      <div className="perfil-box">
        <img src={usuario.foto_url} alt="Foto do usuário" className="perfil-foto" />
        <div className="perfil-info">
          <p><strong>Nome:</strong> {usuario.first_name} {usuario.last_name}</p>
          <p><strong>Usuário:</strong> {usuario.username}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Cargo:</strong> {usuario.cargo?.nome}</p>
          <p><strong>Curso:</strong> {usuario.curso?.nome}</p>
          <p><strong>Último login:</strong> {new Date(usuario.data_ultimo_login).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="perfil-alterar-linha">
        <input
          type="password"
          placeholder="Nova senha de acesso"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className="perfil-field-alterar-senha"
        />
        <button className="perfil-btn" onClick={handleAlterarSenha}>Salvar</button>
      </div>

      <div className="perfil-alterar-linha">
        <input
          type="password"
          placeholder="Nova senha de assinatura"
          value={novaSenhaAssinatura}
          onChange={(e) => setNovaSenhaAssinatura(e.target.value)}
          className="perfil-field-alterar-senha"
        />
        <button className="perfil-btn" onClick={handleAlterarSenhaAssinatura}>Salvar</button>
      </div>
    </div>
  );
}
