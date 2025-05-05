// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (login, senha) => {
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha })
      });
  
      if (!res.ok) throw new Error('Falha na autenticação');
  
      const data = await res.json();
  
      // VERIFICA SE É O USUÁRIO ESPERADO (pode refinar isso para mais controle)
      const usuarioValido =
        (data?.email === login || data?.cpf === login) &&
        data?.senha === senha && // ← Verificação extra
        data?.nome;

  
      if (usuarioValido) {
        setUser(data);
        navigate('/dashboard');
      } else {
        throw new Error('Usuário inválido');
      }
    } catch (error) {
      alert('Credenciais inválidas');
      console.error(error);
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
