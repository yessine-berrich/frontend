// app/components/tables/UsersTable.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  Search,
  MoreVertical,
  Mail,
  Shield,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  FileText,
  Crown,
  User,
  CheckCircle,
  XCircle,
  Filter,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface UserTableItem {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'contributor' | 'reader';
  status: 'active' | 'inactive' | 'pending';
  articles: number;
  joinedAt: string;
  lastActive: string;
  department?: string;
}

interface UsersTableProps {
  users: UserTableItem[];
  onEditUser: (user: UserTableItem) => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  onChangeRole: (id: string, newRole: UserTableItem['role']) => void;
  onInviteUser: () => void;
  title?: string;
  description?: string;
  showStats?: boolean;
  showFilters?: boolean;
  className?: string;
}

type SortField = 'name' | 'role' | 'status' | 'articles' | 'lastActive';
type SortDirection = 'asc' | 'desc';

export default function UsersTable({
  users,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  onChangeRole,
  onInviteUser,
  title = 'Utilisateurs',
  description = 'Gérez les utilisateurs de votre organisation',
  showStats = true,
  showFilters = true,
  className = '',
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Calcul des statistiques
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    admins: users.filter((u) => u.role === 'admin').length,
    pending: users.filter((u) => u.status === 'pending').length,
    contributors: users.filter((u) => u.role === 'contributor').length,
    editors: users.filter((u) => u.role === 'editor').length,
  };

  // Fonction pour obtenir les informations du rôle
  const getRoleInfo = (role: UserTableItem['role']) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
          icon: Crown,
        };
      case 'editor':
        return {
          label: 'Éditeur',
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
          icon: Edit,
        };
      case 'contributor':
        return {
          label: 'Contributeur',
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
          icon: FileText,
        };
      case 'reader':
        return {
          label: 'Lecteur',
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
          icon: User,
        };
    }
  };

  // Fonction pour obtenir les informations du statut
  const getStatusInfo = (status: UserTableItem['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Actif',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-500',
          icon: CheckCircle,
        };
      case 'inactive':
        return {
          label: 'Inactif',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-400',
          icon: XCircle,
        };
      case 'pending':
        return {
          label: 'En attente',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-500',
          icon: Star,
        };
    }
  };

  // Fonction pour obtenir les initiales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filtrage et tri
  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'articles':
          aValue = a.articles;
          bValue = b.articles;
          break;
        case 'lastActive':
          // Convertir "il y a X temps" en ordre chronologique
          aValue = getTimeValue(a.lastActive);
          bValue = getTimeValue(b.lastActive);
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Fonction utilitaire pour trier par temps
  function getTimeValue(timeString: string): number {
    if (timeString.includes('min')) return 1;
    if (timeString.includes('heure')) return 60;
    if (timeString.includes('jour')) return 1440;
    if (timeString.includes('jours')) return 1440 * parseInt(timeString);
    if (timeString.includes('Jamais')) return 999999;
    return 0;
  }

  // Gestion du tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Rendu de l'icône de tri
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={onInviteUser}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 self-start"
        >
          <UserPlus className="h-4 w-4" />
          Inviter un utilisateur
        </button>
      </div>

      {/* Cartes de statistiques */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: UsersIcon, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { label: 'Actifs', value: stats.active, icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            { label: 'Admins', value: stats.admins, icon: Crown, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
            { label: 'Contributeurs', value: stats.contributors, icon: FileText, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            { label: 'Éditeurs', value: stats.editors, icon: Edit, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { label: 'En attente', value: stats.pending, icon: Star, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color.split(' ')[0]} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton filtre */}
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
                expandedFilters || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtres
              {(roleFilter !== 'all' || statusFilter !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-white"></span>
              )}
            </button>
          </div>

          {/* Filtres avancés */}
          {expandedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtre par rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRoleFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        roleFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Tous les rôles
                    </button>
                    {['admin', 'editor', 'contributor', 'reader'].map((role) => {
                      const roleInfo = getRoleInfo(role as UserTableItem['role']);
                      return (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                            roleFilter === role
                              ? 'bg-blue-600 text-white'
                              : roleInfo.color
                          }`}
                        >
                          <roleInfo.icon className="h-3 w-3" />
                          {roleInfo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filtre par statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        statusFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Tous les statuts
                    </button>
                    {['active', 'inactive', 'pending'].map((status) => {
                      const statusInfo = getStatusInfo(status as UserTableItem['status']);
                      return (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                            statusFilter === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${statusInfo.bgColor}`}></div>
                          {statusInfo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* En-tête du tableau */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="col-span-5 lg:col-span-3">
            <button
              onClick={() => handleSort('name')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Utilisateur
              {renderSortIcon('name')}
            </button>
          </div>
          <div className="hidden lg:block col-span-2">
            <button
              onClick={() => handleSort('role')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Rôle
              {renderSortIcon('role')}
            </button>
          </div>
          <div className="hidden lg:block col-span-2">
            <button
              onClick={() => handleSort('status')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Statut
              {renderSortIcon('status')}
            </button>
          </div>
          <div className="hidden lg:block col-span-2">
            <button
              onClick={() => handleSort('articles')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Articles
              {renderSortIcon('articles')}
            </button>
          </div>
          <div className="hidden lg:block col-span-2">
            <button
              onClick={() => handleSort('lastActive')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Dernière activité
              {renderSortIcon('lastActive')}
            </button>
          </div>
          <div className="col-span-7 lg:col-span-1 text-right">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Actions
            </span>
          </div>
        </div>

        {/* Corps du tableau */}
        {filteredAndSortedUsers.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const statusInfo = getStatusInfo(user.status);
              const RoleIcon = roleInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  {/* Informations utilisateur */}
                  <div className="col-span-5 lg:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusInfo.bgColor}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.department && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {user.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rôle (desktop) */}
                  <div className="hidden lg:block col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* Statut (desktop) */}
                  <div className="hidden lg:block col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Articles (desktop) */}
                  <div className="hidden lg:block col-span-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.articles}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        articles
                      </span>
                    </div>
                  </div>

                  {/* Dernière activité (desktop) */}
                  <div className="hidden lg:block col-span-2">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 dark:text-white">{user.lastActive}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Membre depuis {user.joinedAt}
                      </p>
                    </div>
                  </div>

                  {/* Vue mobile compacte */}
                  <div className="col-span-5 lg:hidden">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {roleInfo.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.articles} articles</span>
                        </div>
                        <div className="text-sm text-gray-500">{user.lastActive}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 lg:col-span-1">
                    <div className="flex justify-end">
                      <div className="relative group">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Menu déroulant */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <div className="py-1">
                            <button
                              onClick={() => onEditUser(user)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Voir le profil
                            </button>

                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Envoyer un email
                            </button>

                            {/* Changer le rôle */}
                            <div className="relative group/submenu">
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  Changer le rôle
                                </div>
                                <span>›</span>
                              </button>

                              {/* Options de rôle */}
                              <div className="absolute left-full top-0 ml-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible">
                                {['admin', 'editor', 'contributor', 'reader'].map((role) => {
                                  const roleOpt = getRoleInfo(role as UserTableItem['role']);
                                  return (
                                    <button
                                      key={role}
                                      onClick={() => onChangeRole(user.id, role as UserTableItem['role'])}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                      <roleOpt.icon className="h-3 w-3" />
                                      {roleOpt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Activer/Désactiver */}
                            <button
                              onClick={() =>
                                onToggleStatus(
                                  user.id,
                                  user.status === 'active' ? 'inactive' : 'active'
                                )
                              }
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              {user.status === 'active' ? (
                                <>
                                  <XCircle className="h-4 w-4 text-gray-500" />
                                  Désactiver le compte
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Activer le compte
                                </>
                              )}
                            </button>

                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <UsersIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Aucun utilisateur trouvé
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Résumé */}
      {filteredAndSortedUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div>
            Affichage de{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredAndSortedUsers.length}
            </span>{' '}
            utilisateurs sur {stats.total}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>{((stats.active / stats.total) * 100).toFixed(1)}% d'utilisateurs actifs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}