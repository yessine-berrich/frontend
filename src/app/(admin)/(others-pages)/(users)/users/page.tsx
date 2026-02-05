// app/(admin)/(others-pages)/(users)/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import UsersTable, { UserTableItem } from '@/components/tables/UsersTable';

const initialUsers: UserTableItem[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@entreprise.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'admin',
    status: 'active',
    articles: 24,
    joinedAt: 'Jan 2023',
    lastActive: 'il y a 2 min',
    department: 'IT',
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie.martin@entreprise.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'editor',
    status: 'active',
    articles: 18,
    joinedAt: 'Mar 2023',
    lastActive: 'il y a 1 heure',
    department: 'Design',
  },
  {
    id: '3',
    name: 'Pierre Durand',
    email: 'pierre.durand@entreprise.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'contributor',
    status: 'active',
    articles: 12,
    joinedAt: 'Jun 2023',
    lastActive: 'il y a 3 heures',
    department: 'Dev',
  },
  {
    id: '4',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@entreprise.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    role: 'contributor',
    status: 'active',
    articles: 8,
    joinedAt: 'Sep 2023',
    lastActive: 'il y a 1 jour',
    department: 'Marketing',
  },
  {
    id: '5',
    name: 'Lucas Petit',
    email: 'lucas.petit@entreprise.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'reader',
    status: 'active',
    articles: 0,
    joinedAt: 'Nov 2023',
    lastActive: 'il y a 2 jours',
    department: 'RH',
  },
  {
    id: '6',
    name: 'Emma Lefebvre',
    email: 'emma.lefebvre@entreprise.com',
    role: 'contributor',
    status: 'pending',
    articles: 0,
    joinedAt: 'Déc 2023',
    lastActive: 'Jamais',
    department: 'IT',
  },
  {
    id: '7',
    name: 'Thomas Moreau',
    email: 'thomas.moreau@entreprise.com',
    role: 'reader',
    status: 'inactive',
    articles: 2,
    joinedAt: 'Fév 2023',
    lastActive: 'il y a 30 jours',
    department: 'Dev',
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserTableItem[]>(initialUsers);

  // Charger les utilisateurs depuis localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('knowledgehub-users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    }
  }, []);

  // Sauvegarder les utilisateurs
  useEffect(() => {
    localStorage.setItem('knowledgehub-users', JSON.stringify(users));
  }, [users]);

  const handleEditUser = (user: UserTableItem) => {
    console.log('Éditer utilisateur:', user);
    // TODO: Ouvrir modal d'édition
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleToggleStatus = (id: string, newStatus: 'active' | 'inactive') => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, status: newStatus } : user
    ));
  };

  const handleChangeRole = (id: string, newRole: UserTableItem['role']) => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, role: newRole } : user
    ));
  };

  const handleInviteUser = () => {
    // TODO: Implémenter la logique d'invitation
    alert('Fonctionnalité d\'invitation à implémenter');
  };

  return (
    <div className="p-4 md:p-6">
      <UsersTable
        users={users}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onChangeRole={handleChangeRole}
        onInviteUser={handleInviteUser}
        title="Gestion des Utilisateurs"
        description="Gérez les accès, rôles et permissions des membres de votre organisation"
      />
    </div>
  );
}