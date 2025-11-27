import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AppState, Task, User, ThemeMode, Priority, TaskStatus, TaskTemplate, Organization, Role } from '../types';
import { MOCK_TASKS, MOCK_USERS, MOCK_ORGS, STORAGE_KEYS } from '../constants';

interface DataContextType {
  // Visible Data (Filtered by Tenant)
  users: User[];
  tasks: Task[];
  templates: TaskTemplate[];
  organizations: Organization[];
  
  // State
  currentUser: User | null;
  themeMode: ThemeMode;
  isChristmasEnabled: boolean;
  isDarkMode: boolean;
  apiKey: string;
  
  // Actions
  setApiKey: (key: string) => void;
  setCurrentUser: (user: User | null) => void;
  
  // Super Admin Actions
  addOrganization: (name: string, adminUsername: string, adminPass: string, adminName: string) => void;

  // Admin/Analyst Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'organizationId'>) => void;
  createTaskRange: (taskBase: Omit<Task, 'id' | 'createdAt' | 'status' | 'deadline' | 'organizationId'>, deadlineTime: string, startDate: string, endDate: string) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (taskId: string, notes?: string) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  
  addUser: (fullName: string, username: string, password: string, role: Role) => void;
  resetUserPassword: (userId: string, newPass: string) => void;
  
  toggleThemeMode: () => void;
  toggleDarkMode: () => void;
  setChristmasThemeEnabled: (enabled: boolean) => void;
  
  // Template & Export
  saveTemplate: (template: Omit<TaskTemplate, 'organizationId'>) => void;
  deleteTemplate: (id: string) => void;
  assignTemplateToUser: (templateId: string, userId: string, startDate: string, endDate: string) => void;
  exportToCSV: () => void;
}

export const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- RAW DATA (Global Store) ---
  const [rawUsers, setRawUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [rawTasks, setRawTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [rawTemplates, setRawTemplates] = useState<TaskTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [rawOrgs, setRawOrgs] = useState<Organization[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.ORGS);
      return saved ? JSON.parse(saved) : MOCK_ORGS;
  });

  // --- SETTINGS ---
  const [isChristmasEnabled, setChristmasThemeEnabledState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.CHRISTMAS_ENABLED) === 'true';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as ThemeMode) || 'normal';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
  });

  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || process.env.API_KEY || '';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(rawUsers)), [rawUsers]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(rawTasks)), [rawTasks]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(rawTemplates)), [rawTemplates]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(rawOrgs)), [rawOrgs]);
  
  useEffect(() => localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode), [themeMode]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CHRISTMAS_ENABLED, String(isChristmasEnabled)), [isChristmasEnabled]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDarkMode)), [isDarkMode]);
  useEffect(() => { if (apiKey) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey); }, [apiKey]);

  // Apply Dark Mode
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Revert Theme Safety
  useEffect(() => {
    if (!isChristmasEnabled && themeMode === 'christmas') {
      setThemeMode('normal');
    }
  }, [isChristmasEnabled, themeMode]);


  // --- MULTITENANCY FILTERING ---
  
  const filteredUsers = useMemo(() => {
      if (!currentUser) return [];
      if (currentUser.role === Role.SUPER_ADMIN) return rawUsers; // See all (or maybe just Admins, but seeing all is safer for debugging)
      return rawUsers.filter(u => u.organizationId === currentUser.organizationId);
  }, [rawUsers, currentUser]);

  const filteredTasks = useMemo(() => {
      if (!currentUser) return [];
      if (currentUser.role === Role.SUPER_ADMIN) return []; // Super Admin doesn't manage tasks
      return rawTasks.filter(t => t.organizationId === currentUser.organizationId);
  }, [rawTasks, currentUser]);

  const filteredTemplates = useMemo(() => {
      if (!currentUser) return [];
      if (currentUser.role === Role.SUPER_ADMIN) return [];
      return rawTemplates.filter(t => t.organizationId === currentUser.organizationId);
  }, [rawTemplates, currentUser]);

  const filteredOrgs = useMemo(() => {
      // Only Super Admin sees org list
      return currentUser?.role === Role.SUPER_ADMIN ? rawOrgs : [];
  }, [rawOrgs, currentUser]);


  // --- HELPERS ---
  const getNextId = (items: any[], offset: number = 0): string => {
    const ids = items.map(t => parseInt(t.id, 10)).filter(n => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextId = maxId + 1 + offset;
    return String(nextId).padStart(4, '0');
  };

  const generateUUID = () => Math.random().toString(36).substring(2, 15);

  // --- ACTIONS ---

  const setApiKey = (key: string) => setApiKeyState(key);

  // SUPER ADMIN ACTIONS
  const addOrganization = (name: string, adminUsername: string, adminPass: string, adminName: string) => {
      if (currentUser?.role !== Role.SUPER_ADMIN) return;
      
      const newOrgId = `org_${Date.now()}`;
      const newOrg: Organization = {
          id: newOrgId,
          name,
          createdAt: new Date().toISOString(),
          isActive: true
      };

      const newAdmin: User = {
          id: `u_${Date.now()}`,
          organizationId: newOrgId,
          username: adminUsername,
          password: adminPass,
          fullName: adminName,
          role: Role.ADMIN
      };

      setRawOrgs(prev => [...prev, newOrg]);
      setRawUsers(prev => [...prev, newAdmin]);
  };

  // ADMIN / ANALYST ACTIONS

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'status' | 'organizationId'>) => {
    if (!currentUser) return;
    const task: Task = {
      ...newTask,
      id: getNextId(rawTasks),
      organizationId: currentUser.organizationId,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    setRawTasks(prev => [task, ...prev]);
  };

  const createTaskRange = (
    taskBase: Omit<Task, 'id' | 'createdAt' | 'status' | 'deadline' | 'organizationId'>, 
    deadlineTime: string, 
    startDate: string, 
    endDate: string
  ) => {
    if (!currentUser) return;
    const newTasks: Task[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    current.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    let idCounter = 0;
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const deadline = `${dateStr}T${deadlineTime}`;
      
      newTasks.push({
        ...taskBase,
        organizationId: currentUser.organizationId,
        deadline,
        id: '', // Set later
        status: TaskStatus.PENDING,
        createdAt: new Date().toISOString()
      });
      current.setDate(current.getDate() + 1);
      idCounter++;
    }
    
    setRawTasks(prev => {
        // Calculate IDs based on latest global state
        return [
            ...newTasks.map((t, idx) => ({ ...t, id: getNextId(prev, idx) })), 
            ...prev
        ];
    });
  };

  const updateTask = (updatedTask: Task) => {
    setRawTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setRawTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (taskId: string) => {
    setRawTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isCompleted = t.status === TaskStatus.COMPLETED;
        return {
          ...t,
          status: isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED,
          completedAt: isCompleted ? undefined : new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const updateTaskNotes = (taskId: string, notes: string) => {
    setRawTasks(prev => prev.map(t => t.id === taskId ? { ...t, notes } : t));
  };

  const addUser = (fullName: string, username: string, password: string, role: Role) => {
      if (!currentUser) return;
      const newUser: User = {
          id: `u_${Date.now()}`,
          organizationId: currentUser.organizationId, // Bind to current admin's org
          fullName,
          username,
          password,
          role
      };
      setRawUsers(prev => [...prev, newUser]);
  };

  const resetUserPassword = (userId: string, newPass: string) => {
    setRawUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
  };

  const toggleThemeMode = () => {
    if (!isChristmasEnabled && themeMode === 'normal') return;
    setThemeMode(prev => prev === 'normal' ? 'christmas' : 'normal');
  };
  
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const setChristmasThemeEnabled = (enabled: boolean) => setChristmasThemeEnabledState(enabled);

  // --- TEMPLATES ---

  const saveTemplate = (template: Omit<TaskTemplate, 'organizationId'>) => {
    if (!currentUser) return;
    const fullTemplate: TaskTemplate = { ...template, organizationId: currentUser.organizationId };
    
    setRawTemplates(prev => {
        const exists = prev.find(t => t.id === template.id);
        if (exists) {
            return prev.map(t => t.id === template.id ? fullTemplate : t);
        }
        return [...prev, fullTemplate];
    });
  };

  const deleteTemplate = (id: string) => {
    setRawTemplates(prev => prev.filter(t => t.id !== id));
  };

  const assignTemplateToUser = (templateId: string, userId: string, startDate: string, endDate: string) => {
    if (!currentUser) return;
    const template = rawTemplates.find(t => t.id === templateId);
    if (!template) return;

    let current = new Date(startDate);
    const end = new Date(endDate);
    current.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    const newTasks: Task[] = [];

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      template.items.forEach(item => {
         const deadline = `${dateStr}T${item.timeOffset}`;
         newTasks.push({
            id: '',
            organizationId: currentUser.organizationId,
            title: item.title,
            description: item.description,
            category: item.category,
            priority: item.priority,
            assignedTo: userId,
            deadline: deadline,
            status: TaskStatus.PENDING,
            createdAt: new Date().toISOString()
         });
      });
      current.setDate(current.getDate() + 1);
    }

    setRawTasks(prev => {
        return [
            ...newTasks.map((t, idx) => ({ ...t, id: getNextId(prev, idx) })),
            ...prev
        ];
    });
  };

  const exportToCSV = () => {
      // Exports only filtered tasks
      const headers = ['ID', 'Título', 'Categoría', 'Prioridad', 'Estado', 'Asignado A', 'Fecha Límite', 'Completado En', 'Notas'];
      const rows = filteredTasks.map(t => {
          const user = filteredUsers.find(u => u.id === t.assignedTo);
          return [
              t.id,
              `"${t.title.replace(/"/g, '""')}"`,
              `"${t.category.replace(/"/g, '""')}"`,
              t.priority,
              t.status,
              `"${(user ? user.fullName : 'Desconocido').replace(/"/g, '""')}"`,
              t.deadline,
              t.completedAt || '',
              `"${(t.notes || '').replace(/"/g, '""')}"`
          ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_tareas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <DataContext.Provider value={{
      users: filteredUsers,
      tasks: filteredTasks,
      templates: filteredTemplates,
      organizations: filteredOrgs,
      currentUser, 
      themeMode,
      isChristmasEnabled,
      isDarkMode,
      apiKey,
      setApiKey,
      setCurrentUser,
      addOrganization,
      addTask,
      createTaskRange,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      updateTaskNotes,
      addUser,
      resetUserPassword,
      toggleThemeMode,
      toggleDarkMode,
      setChristmasThemeEnabled,
      saveTemplate,
      deleteTemplate,
      assignTemplateToUser,
      exportToCSV
    }}>
      {children}
    </DataContext.Provider>
  );
};