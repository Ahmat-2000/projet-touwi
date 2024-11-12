'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, apiRoutes } from '@/services/apiService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Réinitialise l'erreur à chaque tentative de connexion

    try {
      const response = await apiService.post(apiRoutes.login(), { username, password });
      
      console.log(response.);
      if (response.status === 200) {
        console.log("fdfd");
        localStorage.setItem('token', response.data.token); // Stocke le token reçu
        router.push('/workspaces'); // Rediriger vers le tableau de bord
      } else {
        console.log("yo");
        throw new Error('Identifiants incorrects');
      }
    } catch (error) {
      console.log("salut");
      console.error(error);
      setError('Identifiants incorrects ou problème serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      
      {error && <div>{error}</div>}

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
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default Login;
