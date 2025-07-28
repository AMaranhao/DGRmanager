import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (login, senha) => {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, senha }),
    });

    if (!res.ok) throw new Error('Falha na autenticação');

    const data = await res.json();

    if (data?.token) {
      // Armazena token separadamente
      localStorage.setItem('token', data.token);

      // Armazena dados do usuário
      const userData = {
        nome: data.nome,
        cargo: data.cargo,
        permissoes: data.permissoes || [],
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/agenda');
    } else {
      throw new Error('Usuário ou senha inválidos');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

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
