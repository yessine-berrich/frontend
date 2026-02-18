"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import CreateArticleModal from "@/components/modals/CreateArticleModal";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";

interface ArticleSearchResult {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string;
  similarity?: number;
  status?: string;
  // ajoute d'autres champs que ton API renvoie
}

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // ── Recherche sémantique ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ArticleSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Toggle sidebar
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Raccourci clavier ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche sémantique – appel API
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const res = await fetch("http://localhost:3000/api/articles/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: searchQuery.trim(),
            limit: 8,             // ← tu peux ajuster
            minSimilarity: 0.3,  // ← ton seuil par défaut
            // status: "published",   // décommente si besoin
          }),
        });

        const data = await res.json();

        if (data.success) {
          setSearchResults(data.results || []);
        } else {
          console.warn("Recherche échouée:", data.message);
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Erreur recherche:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350); // debounce léger

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
        <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
          <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
            {/* Bouton sidebar ... (inchangé) */}

            <Link href="/" className="lg:hidden">
              {/* logos ... (inchangé) */}
            </Link>

            {/* ── Barre de recherche ── */}
            <div className="relative w-full max-w-xl lg:block">
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <svg
                    className="fill-gray-500 dark:fill-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* icône loupe (inchangée) */}
                  </svg>
                </span>

                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Rechercher des articles... (⌘K)"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />

                <div className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>

              {/* Liste des résultats */}
              {showResults && (searchQuery.trim() || searchResults.length > 0) && (
                <div
                  ref={resultsRef}
                  className="absolute left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-[70vh] overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Recherche en cours...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery.trim()
                        ? "Aucun article trouvé"
                        : "Commencez à taper pour rechercher"}
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug || article.id}`}
                          className="flex flex-col px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </span>
                          {article.excerpt && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                              {article.excerpt}
                            </span>
                          )}
                          {article.similarity !== undefined && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Similarité : {(article.similarity * 100).toFixed(0)}%
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bouton menu mobile ... (inchangé) */}
          </div>

          {/* Partie droite (notifications, user, dark mode) – inchangée */}
          <div
            className={`${
              isApplicationMenuOpen ? "flex" : "hidden"
            } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
          >
            <div className="flex items-center gap-2 2xsm:gap-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="relative flex items-center justify-center h-11 w-11 rounded-full bg-white border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                title="Ajouter un article"
              >
                <Plus size={20} />
              </button>

              <ThemeToggleButton />
              <NotificationDropdown />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
};

export default AppHeader;