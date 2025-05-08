import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import '@/styles/pages/login.css';
import '@/styles/mobile.css';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const { login: loginUsuario } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    let erro = '';

    if (!login.trim()) {
      erro = 'Preenchimento do campo Login é obrigatório';
    } else if (!senha.trim()) {
      erro = 'Preenchimento do campo Senha é obrigatória';
    }

    if (erro) {
      setMensagemErro(erro);
      return;
    }

    try {
      await loginUsuario(login, senha);
      setMensagemErro('');
    } catch (err) {
      setMensagemErro('Usuário ou senha inválidos');
    }
  };

  const handleRecuperarSenha = (e) => {
    e.preventDefault();
    alert(`Link de recuperação enviado para: ${emailRecuperacao}`);
    setMostrarRecuperacao(false);
    setEmailRecuperacao('');
  };
/*
  // Simulação temporária:
  alert(`Link de recuperação enviado para: ${emailRecuperacao}`);
  setMostrarRecuperacao(false);
  setEmailRecuperacao('');

  /*
  // Quando o endpoint estiver disponível, use o trecho abaixo:
  try {
    const res = await fetch('http://localhost:3001/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailRecuperacao })
    });
    if (!res.ok) throw new Error('Erro ao enviar e-mail de recuperação');
    alert('Verifique seu e-mail para continuar o processo de recuperação.');
    setMostrarRecuperacao(false);
    setEmailRecuperacao('');
  } catch (error) {
    alert('Falha ao enviar e-mail. Tente novamente.');
  }
      */

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/logo.png" alt="Logo HC-UFPE" className="login-logo" />
          <h1 className="login-title">HC-UFPE</h1>
        </div>

        {!mostrarRecuperacao ? (
          <>
            <form onSubmit={handleLogin} className="login-form">
              <label htmlFor="login">Login</label>
              <Input
                id="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="login-input"
              />

              <label htmlFor="senha">Senha</label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="login-input"
              />

              <p className="login-erro-msg geral">{mensagemErro}</p>

              <Button type="submit" className="login-button">Entrar</Button>
            </form>

            <div className="login-footer">
              <button
                type="button"
                className="login-esqueci"
                onClick={() => setMostrarRecuperacao(true)}
              >
                Esqueci minha senha
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleRecuperarSenha} className="login-form">
            <label htmlFor="email-recuperacao">Informe seu e-mail</label>
            <Input
              id="email-recuperacao"
              value={emailRecuperacao}
              onChange={(e) => setEmailRecuperacao(e.target.value)}
              className="login-input"
            />
            <Button type="submit" className="login-button">Enviar link de recuperação</Button>
            <button
              type="button"
              className="login-esqueci login-voltar"
              onClick={() => setMostrarRecuperacao(false)}
            >
              Voltar para login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
