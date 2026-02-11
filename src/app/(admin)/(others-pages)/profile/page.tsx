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
  const [activeTab, setActiveTab] = useState<'articles' | 'drafts'>('articles');
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
      // Récupérer l'utilisateur connecté via votre service
      const user = await fetchCurrentUser();
      setUserData(user);

      // Charger les articles de l'utilisateur
      await loadUserArticles(user.id);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dans CurrentUserProfilePageWithAPI.tsx

const loadUserArticles = async (userId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/articles/user/${userId}`, {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
            
      // Adapter la structure de données selon votre endpoint
      let articles = [];
      
      if (data.articles && Array.isArray(data.articles)) {
        // Format: { success: true, count: X, articles: [...] }
        articles = data.articles;
      } else if (Array.isArray(data)) {
        // Format: [...]
        articles = data;
      } else {
        console.error('Format de réponse inattendu:', data);
        return;
      }

      // Transformer les articles pour correspondre au format attendu par ArticleCard
      const formattedArticles = articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        description: article.description || article.content?.substring(0, 150) + '...' || '',
        content: article.content,
        authorId: article.author?.id || userId,
        authorName: article.author?.name || `${userData?.firstName} ${userData?.lastName}`,
        category: article.category ? {
          name: article.category.name,
          slug: article.category.name?.toLowerCase().replace(/\s+/g, '-') || 'general',
        } : { name: 'Général', slug: 'general' },
        tags: article.tags || [],
        isFeatured: article.isFeatured || false,
        publishedAt: article.createdAt || article.publishedAt || new Date().toISOString(),
        status: article.status || 'published',
        stats: {
          likes: article.likesCount || article.stats?.likes || 0,
          comments: article.commentsCount || article.stats?.comments || 0,
          views: article.viewsCount || article.stats?.views || 0,
        },
        isLiked: article.isLiked || false,
        isBookmarked: article.isBookmarked || false,
      }));
      
      setUserArticles(formattedArticles);
    }
  } catch (error) {
    console.error('Error loading articles:', error);
  }
};

  // Calculer les statistiques à partir des vraies données
  const userStats = {
    totalArticles: userArticles.length,
    totalLikes: userArticles.reduce((sum, article) => sum + (article.stats?.likes || 0), 0),
    totalComments: userArticles.reduce((sum, article) => sum + (article.stats?.comments || 0), 0),
    totalViews: userArticles.reduce((sum, article) => sum + (article.stats?.views || 0), 0),
  };

  const handleSaveProfile = async (updatedProfile: any) => {
    // La mise à jour est déjà faite dans le modal, il suffit de rafraîchir
    await loadUserData();
  };

  const handleLike = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/articles/${id}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      // Recharger les articles pour mettre à jour les stats
      if (userData) {
        await loadUserArticles(userData.id);
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleBookmark = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/articles/${id}/bookmark`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error bookmarking article:', error);
    }
  };

  const handleShare = (id: string) => {
    // Partage via navigator.share ou copie du lien
    const url = `${window.location.origin}/article/${id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Partager cet article',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/articles/edit/${id}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      // Recharger les articles
      if (userData) {
        await loadUserArticles(userData.id);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Erreur lors de la suppression');
    }
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
            {/* Informations complètes */}
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
            
            {/* Statistiques */}
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
                  
                  <button 
                    onClick={() => window.location.href = '/articles/new'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Nouvel article
                  </button>
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
                    Publiés ({userArticles.filter(a => a.status === 'published').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('drafts')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'drafts'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Brouillons ({userArticles.filter(a => a.status === 'draft').length})
                  </button>
                </div>
              </div>

              {/* Liste des articles */}
              <div className="space-y-6">
                {activeTab === 'articles' ? (
                  userArticles.filter(a => a.status === 'published').length > 0 ? (
                    <>
                      {userArticles.filter(a => a.status === 'published').map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={{
                            ...article,
                            author: {
                              id: userData.id,
                              name: `${userData.firstName} ${userData.lastName}`,
                              initials: `${userData.firstName[0]}${userData.lastName[0]}`,
                              department: userData.department || 'IT',
                              avatar: userData.profileImage,
                            },
                          }}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          showActions={true}
                        />
                      ))}

                      {/* Résumé des performances */}
                      {userArticles.filter(a => a.status === 'published').length > 0 && (
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
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun article publié
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Commencez à partager vos connaissances
                      </p>
                      <button 
                        onClick={() => window.location.href = '/articles/new'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Créer un article
                      </button>
                    </div>
                  )
                ) : (
                  // Section Brouillons
                  userArticles.filter(a => a.status === 'draft').length > 0 ? (
                    userArticles.filter(a => a.status === 'draft').map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={{
                          ...article,
                          author: {
                            id: userData.id,
                            name: `${userData.firstName} ${userData.lastName}`,
                            initials: `${userData.firstName[0]}${userData.lastName[0]}`,
                            department: userData.department || 'IT',
                            avatar: userData.profileImage,
                          },
                        }}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions={true}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun brouillon
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Commencez à rédiger un nouvel article
                      </p>
                      <button 
                        onClick={() => window.location.href = '/articles/new'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Créer un article
                      </button>
                    </div>
                  )
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