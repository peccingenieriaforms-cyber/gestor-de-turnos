import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../contexts/DataContext';
import { AuthContext } from '../contexts/AuthContext';
import { generateShiftReport } from '../services/geminiService';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Copy, LogOut, CheckCircle } from 'lucide-react';

export const ReportView: React.FC = () => {
  const { tasks, apiKey, themeMode } = useContext(DataContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isChristmas = themeMode === 'christmas';

  const myTasks = useMemo(() => {
      return tasks.filter(t => t.assignedTo === currentUser?.id);
  }, [tasks, currentUser]);

  useEffect(() => {
    const fetchReport = async () => {
        if (!currentUser) return;
        if (!apiKey) {
            setError("Falta la API Key de Google Gemini. Contacte al administrador.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const text = await generateShiftReport(apiKey, currentUser, myTasks);
            setReport(text);
        } catch (err) {
            setError("Error conectando con Gemini AI. Por favor intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleCopy = () => {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
      setShowLogoutConfirm(true);
  };

  if (showLogoutConfirm) {
      return (
        <div className="max-w-md mx-auto mt-20 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl text-center border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">¿Turno Finalizado?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Has generado el informe. ¿Deseas cerrar tu sesión ahora?</p>
            <div className="flex gap-4 justify-center">
                <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>Cancelar</Button>
                <Button variant="danger" onClick={logout} isChristmas={isChristmas}>Sí, Cerrar Sesión</Button>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto">
        <div className="mb-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft size={20} className="mr-1"/> Volver al Checklist
            </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    Generador de Informe de Turno
                </h1>
                <p className="opacity-90 text-sm mt-1">Generado automáticamente con Gemini AI 2.5 Flash</p>
            </div>

            <div className="p-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 animate-pulse">Analizando tareas y redactando informe...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
                        <p>{error}</p>
                        <Button onClick={() => window.location.reload()} className="mt-4" variant="secondary">Reintentar</Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-2 flex justify-between items-center">
                             <label className="text-sm font-semibold text-gray-500 uppercase">Vista Previa del Correo</label>
                             <Button variant="ghost" onClick={handleCopy} className={copied ? "text-green-600" : "text-blue-600"}>
                                 {copied ? <CheckCircle size={18} className="mr-1"/> : <Copy size={18} className="mr-1"/>}
                                 {copied ? "Copiado!" : "Copiar Texto"}
                             </Button>
                        </div>
                        <textarea
                            className="w-full h-64 p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center">Este texto es editable. Revísalo antes de enviar.</p>

                        <div className="mt-8 flex justify-center">
                            <Button onClick={handleFinish} variant="primary" isChristmas={isChristmas} className="w-full md:w-1/2 py-3 text-lg">
                                <LogOut className="mr-2"/> Finalizar Proceso
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};
