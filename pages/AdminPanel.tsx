import React, { useContext, useState } from 'react';
import { DataContext } from '../contexts/DataContext';
import { Priority, Role, Task, TaskStatus, TaskTemplate } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Edit2, Key, Snowflake, Download, Layers, UserPlus } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
      tasks, 
      users,
      templates,
      addTask, 
      createTaskRange,
      deleteTask, 
      updateTask, 
      addUser,
      resetUserPassword, 
      themeMode,
      isChristmasEnabled,
      setChristmasThemeEnabled,
      saveTemplate,
      deleteTemplate,
      assignTemplateToUser,
      exportToCSV
  } = useContext(DataContext);
  
  const isChristmas = themeMode === 'christmas';
  
  const [view, setView] = useState<'tasks' | 'users' | 'config'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAssignTemplateModalOpen, setIsAssignTemplateModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // For password reset
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false); // For creating users
  
  // Task Form State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: Priority.MEDIUM,
    assignedTo: '',
    deadlineDate: '',
    deadlineTime: '',
    isRange: false,
    endDate: ''
  });

  // Template Form State
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<{name: string, items: any[]}>({ name: '', items: [] });
  const [assignTemplateData, setAssignTemplateData] = useState({ templateId: '', userId: '', startDate: '', endDate: '' });

  // User Mgmt State
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserForm, setNewUserForm] = useState({ fullName: '', username: '', password: '', role: Role.ANALYST });

  // --- Task Handlers ---

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.isRange && !editingTask && formData.endDate) {
        createTaskRange(
            {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                assignedTo: formData.assignedTo
            },
            formData.deadlineTime,
            formData.deadlineDate,
            formData.endDate
        );
    } else {
        const deadline = `${formData.deadlineDate}T${formData.deadlineTime}`;
        if (editingTask) {
            updateTask({
                ...editingTask,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                assignedTo: formData.assignedTo,
                deadline,
                status: editingTask.status
            } as Task);
        } else {
            addTask({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                assignedTo: formData.assignedTo,
                deadline
            });
        }
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
    resetTaskForm();
  };

  const resetTaskForm = () => {
    setFormData({ 
        title: '', 
        description: '', 
        category: '', 
        priority: Priority.MEDIUM, 
        assignedTo: '', 
        deadlineDate: new Date().toISOString().split('T')[0],
        deadlineTime: '10:00',
        isRange: false,
        endDate: ''
    });
  }

  const openTaskModal = (task?: Task) => {
    if (task) {
        const [date, time] = task.deadline.split('T');
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            assignedTo: task.assignedTo,
            deadlineDate: date,
            deadlineTime: time,
            isRange: false,
            endDate: ''
        });
    } else {
        setEditingTask(null);
        resetTaskForm();
    }
    setIsTaskModalOpen(true);
  };

  // --- Template Handlers ---

  const openTemplateModal = (template?: TaskTemplate) => {
      if (template) {
          setEditingTemplate(template);
          setTemplateForm({ name: template.name, items: [...template.items] });
      } else {
          setEditingTemplate(null);
          setTemplateForm({ name: '', items: [] });
          addItemToTemplate();
      }
      setIsTemplateModalOpen(true);
  };

  const addItemToTemplate = () => {
      setTemplateForm(prev => ({
          ...prev,
          items: [...prev.items, { title: '', description: '', category: 'General', priority: Priority.MEDIUM, timeOffset: '09:00' }]
      }));
  };

  const updateTemplateItem = (index: number, field: string, value: any) => {
      const newItems = [...templateForm.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setTemplateForm(prev => ({ ...prev, items: newItems }));
  };

  const removeTemplateItem = (index: number) => {
      const newItems = templateForm.items.filter((_, i) => i !== index);
      setTemplateForm(prev => ({ ...prev, items: newItems }));
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const templateData = {
          id: editingTemplate ? editingTemplate.id : Math.random().toString(36).substring(2, 9),
          name: templateForm.name,
          items: templateForm.items
      };
      saveTemplate(templateData);
      setIsTemplateModalOpen(false);
  };

  const handleAssignTemplate = (e: React.FormEvent) => {
      e.preventDefault();
      assignTemplateToUser(
          assignTemplateData.templateId, 
          assignTemplateData.userId, 
          assignTemplateData.startDate, 
          assignTemplateData.endDate
      );
      setIsAssignTemplateModalOpen(false);
      setAssignTemplateData({ templateId: '', userId: '', startDate: '', endDate: '' });
      setView('tasks');
      alert('Tareas asignadas correctamente');
  };

  // --- User Handlers ---

  const handlePasswordReset = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedUser && newPassword) {
          resetUserPassword(selectedUser, newPassword);
          setIsUserModalOpen(false);
          setNewPassword('');
          alert("Contraseña actualizada correctamente");
      }
  }

  const handleNewUser = (e: React.FormEvent) => {
      e.preventDefault();
      addUser(newUserForm.fullName, newUserForm.username, newUserForm.password, newUserForm.role);
      setIsNewUserModalOpen(false);
      setNewUserForm({ fullName: '', username: '', password: '', role: Role.ANALYST });
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow gap-2">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            <Button 
                variant={view === 'tasks' ? 'primary' : 'ghost'} 
                onClick={() => setView('tasks')}
                isChristmas={isChristmas}
            >
                Gestión de Tareas
            </Button>
            <Button 
                variant={view === 'users' ? 'primary' : 'ghost'} 
                onClick={() => setView('users')}
                isChristmas={isChristmas}
            >
                Usuarios
            </Button>
            <Button 
                variant={view === 'config' ? 'primary' : 'ghost'} 
                onClick={() => setView('config')}
                isChristmas={isChristmas}
            >
                Configuración
            </Button>
        </div>
        
        {view === 'tasks' && (
            <div className="flex gap-2">
                <Button onClick={exportToCSV} isChristmas={isChristmas} variant="secondary" title="Exportar CSV">
                    <Download size={18} /> <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button onClick={() => setIsAssignTemplateModalOpen(true)} isChristmas={isChristmas} variant="secondary">
                    <Layers size={18} /> <span className="hidden sm:inline">Asignar Plantilla</span>
                </Button>
                <Button onClick={() => openTaskModal()} isChristmas={isChristmas} variant="success">
                    <Plus size={18} /> <span className="hidden sm:inline">Nueva Tarea</span>
                </Button>
            </div>
        )}
        
        {view === 'users' && (
             <Button onClick={() => setIsNewUserModalOpen(true)} isChristmas={isChristmas} variant="success">
                <UserPlus size={18} /> <span className="hidden sm:inline">Crear Usuario</span>
             </Button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        {view === 'tasks' ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Límite</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asignado a</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {tasks.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-4 text-gray-500">No hay tareas en esta organización.</td></tr>
                        ) : tasks.map(task => {
                            const assignedUser = users.find(u => u.id === task.assignedTo);
                            const deadline = new Date(task.deadline);
                            return (
                                <tr key={task.id}>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                                        <div className="text-sm text-gray-500">{task.category}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        {assignedUser?.fullName || 'Desconocido / Borrado'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${task.priority === Priority.CRITICAL ? 'bg-red-100 text-red-800' : 
                                              task.priority === Priority.HIGH ? 'bg-orange-100 text-orange-800' : 
                                              'bg-green-100 text-green-800'}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        {task.status === TaskStatus.COMPLETED ? 'Completado' : 'Pendiente'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => openTaskModal(task)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        ) : view === 'users' ? (
            <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Usuarios de mi Organización</h3>
                <ul className="space-y-4">
                    {users.map(user => (
                        <li key={user.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">Rol: {user.role} | Usuario: {user.username}</p>
                            </div>
                            <Button variant="secondary" isChristmas={isChristmas} onClick={() => { setSelectedUser(user.id); setIsUserModalOpen(true); }}>
                                <Key size={16} className="mr-2"/> Reset Password
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <div className="p-6 space-y-8">
                {/* General Config */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Configuración General</h3>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <div>
                            <div className="flex items-center gap-2">
                                <Snowflake className="text-blue-500" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Tema Navideño</p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                                Habilitar el tema navideño para todos los usuarios.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isChristmasEnabled}
                                    onChange={(e) => setChristmasThemeEnabled(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Templates Config */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Plantillas de Tareas</h3>
                        <Button variant="success" isChristmas={isChristmas} onClick={() => openTemplateModal()}>
                            <Plus size={16} className="mr-1"/> Nueva Plantilla
                        </Button>
                    </div>
                    
                    {templates.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No hay plantillas creadas.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {templates.map(tpl => (
                                <div key={tpl.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{tpl.name}</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => openTemplateModal(tpl)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16}/></button>
                                            <button onClick={() => deleteTemplate(tpl.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">{tpl.items.length} tareas configuradas</p>
                                    <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                                        {tpl.items.slice(0, 3).map((it, idx) => (
                                            <li key={idx}>• {it.title}</li>
                                        ))}
                                        {tpl.items.length > 3 && <li>...</li>}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                  <form onSubmit={handleTaskSubmit} className="space-y-4">
                      <input 
                        className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white" 
                        placeholder="Título" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} required 
                      />
                      <textarea 
                        className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white" 
                        placeholder="Descripción" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} required 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <select 
                            className="p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white"
                            value={formData.priority}
                            onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                        >
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select 
                            className="p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white"
                            value={formData.assignedTo}
                            onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                            required
                        >
                            <option value="">Asignar a...</option>
                            {users.filter(u => u.role !== Role.ADMIN && u.role !== Role.SUPER_ADMIN).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                        </select>
                      </div>
                      <input 
                        className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white" 
                        placeholder="Categoría" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})} required 
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">Fecha Inicio</label>
                            <input 
                                type="date"
                                className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white" 
                                value={formData.deadlineDate} 
                                onChange={e => setFormData({...formData, deadlineDate: e.target.value})} required 
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Hora Límite</label>
                            <input 
                                type="time"
                                className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white" 
                                value={formData.deadlineTime} 
                                onChange={e => setFormData({...formData, deadlineTime: e.target.value})} required 
                            />
                          </div>
                      </div>

                      {!editingTask && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    id="isRange"
                                    checked={formData.isRange}
                                    onChange={e => setFormData({...formData, isRange: e.target.checked})}
                                />
                                <label htmlFor="isRange" className="text-sm font-medium text-gray-900 dark:text-white">Repetir por rango de fechas</label>
                              </div>
                              {formData.isRange && (
                                  <div>
                                      <label className="text-xs text-gray-500">Hasta (Fecha Fin)</label>
                                      <input 
                                        type="date"
                                        className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white" 
                                        value={formData.endDate} 
                                        onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                        required={formData.isRange}
                                      />
                                  </div>
                              )}
                          </div>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancelar</Button>
                          <Button type="submit" variant="primary" isChristmas={isChristmas}>Guardar</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <input 
                        className="w-full p-2 border rounded bg-transparent dark:border-slate-600 dark:text-white font-bold" 
                        placeholder="Nombre de la Plantilla (ej: Cierre Mensual)" 
                        value={templateForm.name} 
                        onChange={e => setTemplateForm({...templateForm, name: e.target.value})} required 
                    />
                    
                    <div className="space-y-3 mt-4">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lista de Tareas en Plantilla</label>
                        {templateForm.items.map((item, idx) => (
                            <div key={idx} className="p-3 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 relative group">
                                <button type="button" onClick={() => removeTemplateItem(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                    <input 
                                        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Título Tarea"
                                        value={item.title} onChange={e => updateTemplateItem(idx, 'title', e.target.value)} required
                                    />
                                    <input 
                                        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Categoría"
                                        value={item.category} onChange={e => updateTemplateItem(idx, 'category', e.target.value)} required
                                    />
                                </div>
                                <input 
                                    className="w-full p-1 border rounded text-sm mb-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Descripción"
                                    value={item.description} onChange={e => updateTemplateItem(idx, 'description', e.target.value)} required
                                />
                                <div className="flex gap-2">
                                    <select 
                                        className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        value={item.priority} onChange={e => updateTemplateItem(idx, 'priority', e.target.value)}
                                    >
                                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <input 
                                        type="time" className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        value={item.timeOffset} onChange={e => updateTemplateItem(idx, 'timeOffset', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" onClick={addItemToTemplate} className="w-full py-1 text-sm border-dashed border-2">
                            <Plus size={14} className="mr-1"/> Agregar Item
                        </Button>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsTemplateModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary" isChristmas={isChristmas}>Guardar Plantilla</Button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {/* Assign Template Modal */}
      {isAssignTemplateModalOpen && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Asignar Plantilla</h2>
                    <form onSubmit={handleAssignTemplate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium dark:text-white">Seleccionar Plantilla</label>
                            <select 
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={assignTemplateData.templateId}
                                onChange={e => setAssignTemplateData({...assignTemplateData, templateId: e.target.value})}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium dark:text-white">Asignar a Analista</label>
                            <select 
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={assignTemplateData.userId}
                                onChange={e => setAssignTemplateData({...assignTemplateData, userId: e.target.value})}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {users.filter(u => u.role !== Role.ADMIN).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium dark:text-white">Desde</label>
                                <input 
                                    type="date" className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={assignTemplateData.startDate}
                                    onChange={e => setAssignTemplateData({...assignTemplateData, startDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium dark:text-white">Hasta</label>
                                <input 
                                    type="date" className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={assignTemplateData.endDate}
                                    onChange={e => setAssignTemplateData({...assignTemplateData, endDate: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsAssignTemplateModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="primary" isChristmas={isChristmas}>Asignar</Button>
                        </div>
                    </form>
                </div>
           </div>
      )}

      {/* Password Reset Modal */}
      {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Resetear Contraseña</h3>
                  <form onSubmit={handlePasswordReset}>
                    <input 
                        type="password" 
                        placeholder="Nueva contraseña" 
                        className="w-full p-2 border rounded mb-4 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="danger" isChristmas={isChristmas}>Confirmar</Button>
                    </div>
                  </form>
              </div>
          </div>
      )}

      {/* Create User Modal */}
      {isNewUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Nuevo Usuario</h3>
                  <form onSubmit={handleNewUser} className="space-y-3">
                    <input 
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        placeholder="Nombre Completo"
                        value={newUserForm.fullName}
                        onChange={e => setNewUserForm({...newUserForm, fullName: e.target.value})} required
                    />
                    <input 
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        placeholder="Nombre de Usuario"
                        value={newUserForm.username}
                        onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} required
                    />
                    <input 
                        type="password"
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        placeholder="Contraseña"
                        value={newUserForm.password}
                        onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} required
                    />
                    <select
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        value={newUserForm.role}
                        onChange={e => setNewUserForm({...newUserForm, role: e.target.value as Role})}
                    >
                        <option value={Role.ANALYST}>Analista</option>
                        <option value={Role.ADMIN}>Administrador (Co-Admin)</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsNewUserModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary" isChristmas={isChristmas}>Crear</Button>
                    </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};