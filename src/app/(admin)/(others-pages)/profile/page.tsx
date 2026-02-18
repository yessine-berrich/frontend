'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { fetchCurrentUser } from '../../../../../services/auth.service';
import EditableUserProfileHeader from '@/components/user-profile/EditableUserProfileHeader';
import EditableUserAboutCard from '@/components/user-profile/EditableUserAboutCard';
import UserStatsCard from '@/components/public-profile/UserStatsCard';
import ArticleCard from '@/components/article/ArticleCard';
import EditProfileModalWithAPI from '@/components/modals/EditProfileModal';

export default function CurrentUserProfilePageWithAPI() {
  const [activeTab, setActiveTab] = useState<'articles' | 'drafts' | 'rejected'>('articles');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données de l'utilisateur connecté
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await fetchCurrentUser();
      setUserData(user);
      await loadUserArticles(user.id);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserArticles = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:3000/api/articles/user/${userId}`, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : undefined,
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Adapter selon le format de réponse
        let articles = [];
        if (data.articles && Array.isArray(data.articles)) {
          articles = data.articles;
        } else if (Array.isArray(data)) {
          articles = data;
        } else {
          console.error('Format de réponse inattendu:', data);
          return;
        }

        const uid = parseInt(userId);

        // Transformer les articles avec toutes les informations nécessaires
        const formattedArticles = articles.map((article: any) => {
          // Récupérer les stats
          const likesCount = article.likes?.length || article.likesCount || article.stats?.likes || 0;
          const commentsCount = article.comments?.length || article.commentsCount || article.stats?.comments || 0;
          const viewsCount = article.viewsCount || article.stats?.views || 0;
          
          // Vérifier si l'utilisateur courant a liké/bookmarké
          const isLiked = article.likes?.some((like: any) => 
            like.id === uid || like.userId === uid
          ) || article.isLiked || false;
          
          const isBookmarked = article.bookmarks?.some((bookmark: any) => 
            bookmark.id === uid || bookmark.userId === uid
          ) || article.isBookmarked || false;

          return {
            id: article.id.toString(),
            title: article.title,
            description: article.description || article.content?.substring(0, 150) + '...' || '',
            content: article.content,
            author: {
              id: article.author?.id || uid,
              name: article.author?.name || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Utilisateur',
              initials: article.author?.initials || 
                ((userData?.firstName?.charAt(0) || '') + (userData?.lastName?.charAt(0) || '')).toUpperCase() || 'U',
              department: article.author?.department || userData?.department || 'Membre',
              avatar: article.author?.avatar || article.author?.profileImage || userData?.profileImage,
            },
            category: article.category ? {
              name: article.category.name,
              slug: article.category.name?.toLowerCase().replace(/\s+/g, '-') || 'general',
            } : { name: 'Général', slug: 'general' },
            tags: article.tags?.map((tag: any) => tag.name || tag) || [],
            publishedAt: article.publishedAt || article.createdAt,
            status: article.status || 'published',
            stats: {
              likes: likesCount,
              comments: commentsCount,
              views: viewsCount,
            },
            isLiked: isLiked,
            isBookmarked: isBookmarked,
            isFeatured: article.isFeatured || false,
            // Ajouter les informations complètes pour référence
            likes: article.likes || [],
            bookmarks: article.bookmarks || [],
            comments: article.comments || [],
            rejectionReason: article.rejectionReason || null, // Ajout pour les articles refusés
          };
        });
        
        setUserArticles(formattedArticles);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  // Calculer les statistiques à partir des vraies données
  const userStats = {
    totalArticles: userArticles.filter(a => a.status === 'published').length,
    totalLikes: userArticles.reduce((sum, article) => sum + (article.stats?.likes || 0), 0),
    totalComments: userArticles.reduce((sum, article) => sum + (article.stats?.comments || 0), 0),
    totalViews: userArticles.reduce((sum, article) => sum + (article.stats?.views || 0), 0),
  };

  const handleSaveProfile = async (updatedProfile: any) => {
    await loadUserData();
  };

  const handleLike = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Veuillez vous connecter');
        return;
      }

      // Optimistic update
      setUserArticles(prev => prev.map(article => {
        if (article.id === id) {
          const newIsLiked = !article.isLiked;
          return {
            ...article,
            isLiked: newIsLiked,
            stats: {
              ...article.stats,
              likes: article.stats.likes + (newIsLiked ? 1 : -1)
            }
          };
        }
        return article;
      }));

      const response = await fetch(`http://localhost:3000/api/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Rollback en cas d'erreur
        await loadUserArticles(userData.id);
      }
    } catch (error) {
      console.error('Error liking article:', error);
      await loadUserArticles(userData.id);
    }
  };

  const handleBookmark = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Veuillez vous connecter');
        return;
      }

      // Optimistic update
      setUserArticles(prev => prev.map(article => {
        if (article.id === id) {
          return {
            ...article,
            isBookmarked: !article.isBookmarked
          };
        }
        return article;
      }));

      const response = await fetch(`http://localhost:3000/api/articles/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        await loadUserArticles(userData.id);
      }
    } catch (error) {
      console.error('Error bookmarking article:', error);
      await loadUserArticles(userData.id);
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/articles/${id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Partager cet article',
        url: url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleEdit = (id: string) => {
    // Ouvrir le modal d'édition - sera géré par le composant ArticleCard
    console.log('Edit article:', id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await loadUserArticles(userData.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleArticleUpdated = () => {
    loadUserArticles(userData.id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-5"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Impossible de charger vos informations. Veuillez vous reconnecter.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const publishedArticles = userArticles.filter(a => a.status === 'published');
  const draftArticles = userArticles.filter(a => a.status === 'draft');
  const rejectedArticles = userArticles.filter(a => a.status === 'rejected');

  const getTabContent = () => {
    switch (activeTab) {
      case 'articles':
        return publishedArticles;
      case 'drafts':
        return draftArticles;
      case 'rejected':
        return rejectedArticles;
      default:
        return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'articles':
        return {
          title: 'Aucun article publié',
          message: 'Commencez à partager vos connaissances'
        };
      case 'drafts':
        return {
          title: 'Aucun brouillon',
          message: 'Commencez à rédiger un nouvel article'
        };
      case 'rejected':
        return {
          title: 'Aucun article refusé',
          message: 'Tous vos articles ont été approuvés'
        };
    }
  };

  const emptyState = getEmptyMessage();
  const currentArticles = getTabContent();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header avec bouton Modifier */}
        <EditableUserProfileHeader 
          user={{
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImage: userData.profileImage,
            role: userData.role || 'Utilisateur',
            department: userData.department || 'Non spécifié',
            email: userData.email,
          }}
          stats={userStats}
          isCurrentUser={true}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== Colonne de gauche : Informations profil ===== */}
          <div className="space-y-6">
            <EditableUserAboutCard 
              user={{
                bio: userData.bio,
                location: userData.city && userData.country ? `${userData.city}, ${userData.country}` : undefined,
                city: userData.city,
                country: userData.country,
                postalCode: userData.postalCode,
                joinDate: userData.createdAt,
                website: userData.website,
                email: userData.email,
                phone: userData.phone,
              }}
              isCurrentUser={true}
            />
            
            <UserStatsCard stats={userStats} />
          </div>

          {/* ===== Colonne de droite : Mes articles ===== */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              
              {/* En-tête */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                      Mes Articles
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Gérez et suivez les performances de vos publications
                    </p>
                  </div>
                </div>

                {/* Onglets */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'articles'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Publiés ({publishedArticles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('drafts')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'drafts'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Brouillons ({draftArticles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('rejected')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'rejected'
                        ? 'border-red-600 text-red-600 dark:text-red-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Refusés ({rejectedArticles.length})
                  </button>
                </div>
              </div>

              {/* Liste des articles */}
              <div className="space-y-6">
                {currentArticles.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {emptyState.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {emptyState.message}
                    </p>
                    {(activeTab === 'articles' || activeTab === 'drafts') && (
                      <button 
                        onClick={() => window.location.href = '/articles/new'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Créer un article
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {currentArticles.map((article) => (
                      <div key={article.id} className="relative">
                        {activeTab === 'rejected' && article.rejectionReason && (
                          <div className="mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              <span className="font-medium">Raison du refus :</span> {article.rejectionReason}
                            </p>
                          </div>
                        )}
                        <ArticleCard
                          article={{
                            ...article,
                            author: {
                              id: userData.id,
                              name: `${userData.firstName} ${userData.lastName}`,
                              initials: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
                              department: userData.department || 'Membre',
                              avatar: userData.profileImage,
                            },
                          }}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onArticleUpdated={handleArticleUpdated}
                          showActions={true}
                          showHistory={true} 
                        />
                      </div>
                    ))}

                    {/* Résumé des performances (onglet publié seulement) */}
                    {activeTab === 'articles' && publishedArticles.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
                          Résumé des performances
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Engagement moyen</div>
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              {userStats.totalArticles > 0 
                                ? Math.round((userStats.totalLikes + userStats.totalComments) / userStats.totalArticles)
                                : 0}
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm text-green-600 dark:text-green-400">Vues/article</div>
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">
                              {userStats.totalArticles > 0 
                                ? Math.round(userStats.totalViews / userStats.totalArticles)
                                : 0}
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-sm text-purple-600 dark:text-purple-400">Taux de likes</div>
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                              {userStats.totalViews > 0 
                                ? Math.round((userStats.totalLikes / userStats.totalViews) * 100)
                                : 0}%
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm text-orange-600 dark:text-orange-400">Taux de commentaires</div>
                            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                              {userStats.totalViews > 0 
                                ? Math.round((userStats.totalComments / userStats.totalViews) * 100)
                                : 0}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Résumé détaillé */}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Total likes reçus :</span> {userStats.totalLikes} ·{' '}
                            <span className="font-medium">Total commentaires :</span> {userStats.totalComments} ·{' '}
                            <span className="font-medium">Total vues :</span> {userStats.totalViews}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification du profil */}
      {userData && (
        <EditProfileModalWithAPI
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={{
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone || '',
            country: userData.country || '',
            city: userData.city || '',
            postalCode: userData.postalCode || '',
            bio: userData.bio || '',
            avatar: userData.profileImage,
          }}
          onSave={handleSaveProfile}
          userId={userData.id}
        />
      )}
    </div>
  );
}