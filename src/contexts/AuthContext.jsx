// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // login simulado via Mockoon (será adaptado para DRF no futuro)
  const login = async (login, senha) => {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, senha }),
    });

    if (!res.ok) throw new Error('Falha na autenticação');

    const data = await res.json();

    const usuarioValido =
      (data?.email === login || data?.cpf === login) &&
      data?.senha === senha &&
      data?.nome;

    if (usuarioValido) {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data)); // persistência
      navigate('/dashboard');
    } else {
      throw new Error('Usuário ou senha inválidos');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // segurança adicional: limpa o estado se não houver localStorage (caso removido manualmente)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored && user) {
      setUser(null);
      navigate('/login');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
