'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, apiRoutes } from '@/services/apiService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await apiService.post(apiRoutes.login(), { username, password });

    if (response.ok) {
      // Rediriger vers le tableau de bord
      document.cookie = `token=${response.token}`;
      router.push('/import');
    } else {
      alert('Incorrect username or password.');
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nom d'utilisateur"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;