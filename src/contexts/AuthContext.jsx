
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import { isTokenExpired } from '../utils/authUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Verifica o token ao iniciar o app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          logout();
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Token inválido:', error);
        logout();
      }
    } else {
      logout();
    }
  }, []);

  const login = async (login, senha) => {
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      });

      if (!res.ok) throw new Error('Falha na autenticação');

      const data = await res.json();

      if (data?.token && data?.refreshToken) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

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
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);