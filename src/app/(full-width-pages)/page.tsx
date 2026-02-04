
import React from 'react';
import Link from 'next/link';

export default function Ecommerce() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
     

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Centralisez le savoir,
            <span className="text-blue-600 dark:text-blue-400"> propulsez l'innovation</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
            KnowHub est la plateforme collaborative qui capture, organise et partage 
            les connaissances de votre entreprise. Mettez fin à la dispersion de l'information 
            et libérez le potentiel collectif de vos équipes.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 dark:text-blue-300 text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                IA Intelligente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Recherche sémantique et chatbot RAG qui comprend le contexte de vos documents
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-green-600 dark:text-green-300 text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Système de commentaires, mentions et validation collaborative des articles
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-purple-600 dark:text-purple-300 text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Gamification
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Score de performance et récompenses pour motiver les contributions
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Prêt à transformer la gestion des connaissances dans votre entreprise ?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Rejoignez dès maintenant la plateforme qui préserve et valorise le savoir-faire de votre organisation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/signin"
                className="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
              >
                Se connecter
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">© 2024 KnowHub. Plateforme de Gestion des Connaissances.</p>
          <p className="text-sm">
            Stack technique : Next.js 14 • NestJS • PostgreSQL • IA OpenAI/Llama 3 • Redis
          </p>
        </div>
      </footer>
    </div>
  );
}