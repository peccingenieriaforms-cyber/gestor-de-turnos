import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../contexts/DataContext';
import { AuthContext } from '../contexts/AuthContext';
import { TaskStatus, Priority } from '../types';
import { Button } from '../components/ui/Button';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

export const AnalystPanel: React.FC = () => {
  const { tasks, toggleTaskStatus, updateTaskNotes, themeMode } = useContext(DataContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const isChristmas = themeMode === 'christmas';

  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedTo === currentUser?.id);
  }, [tasks, currentUser]);

  const completedCount = myTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const progress = myTasks.length > 0 ? Math.round((completedCount / myTasks.length) * 100) : 0;

  // Sort: Priority (Critical > High > Medium > Low) then Deadline
  // Removed sorting by status to prevent tasks from jumping around when clicked
  const sortedTasks = [...myTasks].sort((a, b) => {
      const pOrder: Record<string, number> = { 
          [Priority.CRITICAL]: 0, 
          [Priority.HIGH]: 1, 
          [Priority.MEDIUM]: 2, 
          [Priority.LOW]: 3 
      };
      
      const diff = (pOrder[a.priority] ?? 4) - (pOrder[b.priority] ?? 4);
      if (diff !== 0) return diff;
      
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Progress */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-t-4 border-blue-500 dark:border-blue-400">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Turno</h2>
                <p className="text-gray-500 dark:text-gray-400">Completa tus tareas para generar el informe final.</p>
            </div>
            <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{progress}%</div>
                <span className="text-xs text-gray-500">Completado</span>
            </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No tienes tareas asignadas para este turno.</div>
        ) : sortedTasks.map(task => (
            <div 
                key={task.id} 
                className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-all duration-200 border-l-4 
                    ${task.status === TaskStatus.COMPLETED ? 'border-green-500 opacity-75' : 
                      task.priority === Priority.CRITICAL ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900' : 'border-blue-500'}
                `}
            >
                <div className="flex items-start gap-4">
                    <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-1 p-1 rounded-full transition-colors ${task.status === TaskStatus.COMPLETED ? 'text-green-600 bg-green-100' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                        <CheckCircle size={24} fill={task.status === TaskStatus.COMPLETED ? "currentColor" : "none"} />
                    </button>
                    
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <h3 className={`text-lg font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                task.priority === Priority.CRITICAL ? 'bg-red-100 text-red-800' : 
                                task.priority === Priority.HIGH ? 'bg-orange-100 text-orange-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {task.priority}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{task.description}</p>
                        
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock size={12}/> Límite: {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{task.category}</span>
                        </div>

                        {/* Notes Section */}
                        <div className="mt-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas / Observaciones</label>
                            <textarea 
                                className="w-full mt-1 p-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                rows={2}
                                placeholder="Añade detalles importantes aquí..."
                                value={task.notes || ''}
                                onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-4 flex justify-center pb-4">
        <Button 
            onClick={() => navigate('/report')}
            isChristmas={isChristmas}
            className="shadow-xl transform hover:scale-105 px-8 py-3 text-lg"
            disabled={myTasks.length === 0}
        >
            <FileText className="mr-2" /> Finalizar Turno y Generar Informe
        </Button>
      </div>
    </div>
  );
};