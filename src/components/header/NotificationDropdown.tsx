'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { fetchCurrentUser } from "../../../services/auth.service";
import ArticleDetailModal from '@/components/modals/ArticleDetailModal';

// Types
interface Notification {
  id: number;
  type: "mention" | "reply" | "new_comment";
  isRead: boolean;
  createdAt: string;
  message?: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
  data?: {
    commentId?: number;
    articleId?: number;
    parentCommentId?: number;
  };
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "";
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "1" : "1";

  useEffect(() => {
    fetchCurrentUser()
      .then(() => setLoading(false))
      .catch((error) => {
        console.error("Error fetching user:", error);
        setLoading(false);
      });
  }, []);

  // Charger les notifications initiales
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:3000/api/notifications?limit=20&unreadOnly=false",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const data = await res.json();
        setNotifications(data || []);
        const unread = data.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Erreur chargement notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  // Connexion WebSocket
  useEffect(() => {
    if (!userId || !token) return;

    const newSocket = io("http://localhost:3000/notifications", {
      query: { userId: userId.toString() },
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("new_notification", (newNotif: Notification) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, token]);

  const handleOpen = async () => {
    setIsOpen(true);

    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Erreur mark all read:", err);
    }
  };

  const closeDropdown = () => setIsOpen(false);

// Dans NotificationDropdown.tsx
const handleOpenArticleModal = async (articleId: number, commentId?: number) => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`http://localhost:3000/api/articles/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const articleData = await response.json();
    
    // ✅ Formater correctement toutes les données
    const formattedArticle = {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      description: articleData.description || articleData.content?.substring(0, 150) + '...' || '',
      
      // ✅ S'assurer que author est un objet avec des propriétés scalaires
      author: {
        id: articleData.author?.id || 0,
        name: typeof articleData.author?.name === 'string' 
          ? articleData.author.name 
          : `${articleData.author?.firstName || ''} ${articleData.author?.lastName || ''}`.trim() || 'Utilisateur',
        initials: ((articleData.author?.firstName?.charAt(0) || '') + 
                  (articleData.author?.lastName?.charAt(0) || '')).toUpperCase() || 'U',
        department: typeof articleData.author?.department === 'string'
          ? articleData.author.department
          : articleData.author?.role || 'Membre',
        avatar: articleData.author?.avatar || null,
      },
      
      // ✅ S'assurer que category est un objet avec des propriétés scalaires
      category: {
        id: articleData.category?.id || 0,
        name: typeof articleData.category?.name === 'string' 
          ? articleData.category.name 
          : 'Général',
        slug: typeof articleData.category?.slug === 'string'
          ? articleData.category.slug
          : 'general',
      },
      
      // ✅ S'assurer que tags est un tableau de strings
      tags: Array.isArray(articleData.tags) 
        ? articleData.tags.map(tag => typeof tag === 'string' ? tag : tag.name || String(tag))
        : [],
      
      isFeatured: false,
      publishedAt: articleData.createdAt || articleData.publishedAt || new Date().toISOString(),
      updatedAt: articleData.updatedAt || null,
      status: articleData.status || 'published',
      
      // ✅ S'assurer que stats a des nombres
      stats: {
        likes: typeof articleData.stats?.likes === 'number' 
          ? articleData.stats.likes 
          : articleData.likes?.length || 0,
        comments: typeof articleData.stats?.comments === 'number'
          ? articleData.stats.comments
          : articleData.comments?.length || 0,
        views: typeof articleData.stats?.views === 'number'
          ? articleData.stats.views
          : articleData.viewsCount || 0,
      },
      
      isLiked: !!articleData.isLiked,
      isBookmarked: !!articleData.isBookmarked,
    };
    
    if (commentId) {
      formattedArticle.scrollToCommentId = commentId;
    }
    
    // ✅ Log pour vérifier le formatage
    console.log('📦 Article formaté:', {
      author: formattedArticle.author,
      category: formattedArticle.category,
      tags: formattedArticle.tags,
    });
    
    setSelectedArticle(formattedArticle);
    setIsArticleModalOpen(true);
    closeDropdown();
  } catch (error) {
    console.error('❌ Erreur chargement article:', error);
    alert("Impossible de charger l'article");
  }
};

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getProfileImageUrl = (userData: any) => {
    if (!userData?.id) return "/images/user/profile.jpg";
    if (userData?.profileImage || userData?.avatar) {
      return `http://localhost:3000/api/users/profile-image/${userData.id}?t=${new Date().getTime()}`;
    }
    return "/images/user/profile.jpg";
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleOpen}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 flex h-2 w-2">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </span>
        )}

        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button onClick={closeDropdown} className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-gray-500 dark:text-gray-400">Aucune notification</p>
          </div>
        ) : (
          <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
            {notifications.map((notif) => (
              <li key={notif.id}>
                <DropdownItem
                  tag="button"
                  onItemClick={closeDropdown}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                    !notif.isRead ? "bg-orange-50 dark:bg-orange-950/20" : ""
                  }`}
                >
                  <span className="relative block w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      width={40}
                      height={40}
                      src={getProfileImageUrl(notif.sender)}
                      alt={notif.sender?.firstName || "User"}
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/user/profile.jpg";
                      }}
                    />
                    {!notif.isRead && (
                      <span className="absolute bottom-0 right-0 z-10 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-white"></span>
                    )}
                  </span>

                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-medium">
                        {notif.sender?.firstName} {notif.sender?.lastName}
                      </span>{" "}
                      {notif.message || "a interagi avec votre contenu"}
                    </p>

                    {notif.data?.articleId && (
                      <span
                        onClick={() => handleOpenArticleModal(notif.data.articleId!, notif.data.commentId)}
                        className="block mt-1 text-xs text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenArticleModal(notif.data.articleId!, notif.data.commentId);
                          }
                        }}
                      >
                        Voir le commentaire →
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {notif.type === "new_comment"
                          ? "Commentaire"
                          : notif.type === "reply"
                          ? "Réponse"
                          : "Mention"}
                      </span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatDate(notif.createdAt)}</span>
                    </div>
                  </div>
                </DropdownItem>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={closeDropdown}
        >
          Voir toutes les notifications
        </Link>
      </Dropdown>

      {/* Modal de l'article */}
      <ArticleDetailModal
        isOpen={isArticleModalOpen}
        onClose={() => {
          setIsArticleModalOpen(false);
          setSelectedArticle(null);
        }}
        article={selectedArticle}
        onLike={async (id: string) => {
          try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:3000/api/articles/${id}/like`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.ok) {
              const result = await response.json();
              setSelectedArticle((prev: any) => ({
                ...prev,
                isLiked: result.article.isLiked,
                stats: {
                  ...prev.stats,
                  likes: result.article.likesCount
                }
              }));
            }
          } catch (error) {
            console.error('Erreur like:', error);
          }
        }}
        onBookmark={async (id: string) => {
          try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:3000/api/articles/${id}/bookmark`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.ok) {
              const result = await response.json();
              setSelectedArticle((prev: any) => ({
                ...prev,
                isBookmarked: result.article.isBookmarked
              }));
            }
          } catch (error) {
            console.error('Erreur bookmark:', error);
          }
        }}
        onShare={(id: string) => {
          const article = selectedArticle;
          if (!article) return;
          
          if (navigator.share) {
            navigator.share({
              title: article.title,
              text: article.description,
              url: `${window.location.origin}/articles/${id}`,
            });
          } else {
            navigator.clipboard.writeText(`${window.location.origin}/articles/${id}`);
            alert('Lien copié !');
          }
        }}
      />
    </div>
  );
}