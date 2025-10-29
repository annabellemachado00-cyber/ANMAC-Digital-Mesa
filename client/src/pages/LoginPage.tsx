import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@anmac.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/panel', { replace: true });
    } catch (err) {
      setError('No pudimos iniciar sesión, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl shadow-indigo-500/10">
        <h1 className="text-2xl font-semibold text-white">Bienvenida a ANMAC Taller OS</h1>
        <p className="mt-2 text-sm text-slate-400">Introduce tus credenciales para continuar.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-200">Correo electrónico</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="usuario@anmac.local"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">Contraseña</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Accesos demo: admin@anmac.local · admin123 | oper@anmac.local · oper123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
