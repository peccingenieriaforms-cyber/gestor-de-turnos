import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Briefcase, Snowflake } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const { themeMode, apiKey, setApiKey } = useContext(DataContext);
  const isChristmas = themeMode === 'christmas';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${isChristmas ? 'bg-christmas-red' : 'bg-gray-100 dark:bg-gray-900'}`}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`p-8 text-center ${isChristmas ? 'bg-christmas-green text-white' : 'bg-blue-600 text-white'}`}>
           <div className="flex justify-center mb-4">
              {isChristmas ? <Snowflake size={48} /> : <Briefcase size={48} />}
           </div>
           <h1 className="text-2xl font-bold">Gestor de Turnos</h1>
           <p className="opacity-80">Acceso Administrativo y Operativo</p>
        </div>

        <div className="p-8">
            {/* API Key Check (Simulated config for production readiness) */}
            {!apiKey && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <p className="font-bold mb-1">Configuración Inicial</p>
                    <p className="mb-2">Se requiere una API Key de Gemini para generar informes.</p>
                    <input 
                        type="password"
                        placeholder="Pegar Gemini API Key"
                        className="w-full p-2 border rounded bg-white"
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                    <input 
                        type="text"
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:text-white"
                        placeholder="Ej: admin"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                    <input 
                        type="password"
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:text-white"
                        placeholder="******"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button type="submit" className="w-full justify-center py-3 text-lg" isChristmas={isChristmas}>
                    Iniciar Sesión
                </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-400">
                <p>Credenciales Demo:</p>
                <p>Admin: admin / admin</p>
                <p>Analista: analista1 / user</p>
            </div>
        </div>
      </div>
    </div>
  );
};
