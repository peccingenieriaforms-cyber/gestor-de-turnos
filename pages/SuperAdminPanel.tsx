import React, { useContext, useState } from 'react';
import { DataContext } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Building, Plus, UserPlus } from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
    const { organizations, addOrganization } = useContext(DataContext);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [orgName, setOrgName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addOrganization(orgName, adminUser, adminPass, adminName);
        setShowModal(false);
        setOrgName('');
        setAdminName('');
        setAdminUser('');
        setAdminPass('');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-purple-600">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Panel Super Administrador</h2>
                <p className="text-gray-500 dark:text-gray-400">Gestión de Empresas (Tenants) y Accesos Maestros.</p>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold dark:text-white">Empresas Registradas</h3>
                <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus size={18} className="mr-2"/> Nueva Empresa
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map(org => (
                    <div key={org.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                                <Building className="text-purple-600 dark:text-purple-300" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg dark:text-white">{org.name}</h4>
                                <p className="text-xs text-gray-500">ID: {org.id}</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            <p>Estado: <span className="text-green-600 font-semibold">Activa</span></p>
                            <p>Creada: {new Date(org.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Nueva Empresa */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Building size={20}/> Registrar Organización
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Nombre de la Empresa</label>
                                <input 
                                    className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={orgName} onChange={e => setOrgName(e.target.value)} required placeholder="Ej: Transportes S.A."
                                />
                            </div>
                            
                            <div className="pt-4 border-t dark:border-slate-700">
                                <h3 className="text-sm font-bold text-purple-600 mb-3 flex items-center gap-2">
                                    <UserPlus size={16}/> Crear Administrador Inicial
                                </h3>
                                <div className="space-y-3">
                                    <input 
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={adminName} onChange={e => setAdminName(e.target.value)} required placeholder="Nombre Completo Admin"
                                    />
                                    <input 
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={adminUser} onChange={e => setAdminUser(e.target.value)} required placeholder="Usuario (Login)"
                                    />
                                    <input 
                                        type="password"
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={adminPass} onChange={e => setAdminPass(e.target.value)} required placeholder="Contraseña"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Crear Empresa</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};