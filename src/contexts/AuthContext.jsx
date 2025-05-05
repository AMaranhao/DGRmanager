// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (login, senha) => {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, senha })
    });
  
    if (!res.ok) {
      throw new Error('Falha na autenticação');
    }
  
    const data = await res.json();

    const usuarioValido =
    (data?.email === login || data?.cpf === login) &&
    data?.senha === senha &&
    data?.nome;
  
    if (usuarioValido) {
      setUser(data);
      navigate('/dashboard');
    } else {
      throw new Error('Usuário ou senha inválidos');
    }
  };
  
  
  

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
