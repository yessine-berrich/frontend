'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Users,
  Brain,
  Search,
  Trophy,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Intelligence Artificielle',
    description: 'Génération et amélioration de contenu assistées par IA',
  },
  {
    icon: Search,
    title: 'Recherche Sémantique',
    description: 'Trouvez instantanément les informations pertinentes',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Travaillez en équipe sur vos articles et projets',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    description: 'Gagnez des badges et montez dans le classement',
  },
];

const benefits = [
  'Centralisation de toutes vos connaissances',
  'Accès rapide à l\'information',
  'Collaboration en temps réel',
  'Analyse et statistiques détaillées',
  'Sécurité et confidentialité garanties',
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 opacity-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-20">
          {/* Header */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                KnowledgeHub
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/signin">
                <button className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Se connecter
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
                  Créer un compte
                </button>
              </Link>
            </div>
          </motion.nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                Propulsé par l'Intelligence Artificielle
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white"
            >
              Votre plateforme de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                gestion des connaissances
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              KnowledgeHub est une solution collaborative innovante qui permet à
              votre entreprise de capturer, organiser et partager le savoir
              collectif avec l'aide de l'intelligence artificielle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup">
                <button className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 min-w-[200px] justify-center">
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/signin">
                <button className="px-8 py-3.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[200px]">
                  J'ai déjà un compte
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">2.5K+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Articles créés
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">500+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Utilisateurs actifs
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">98%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Satisfaction
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Fonctionnalités principales
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Découvrez les outils puissants qui transformeront la gestion du
              savoir dans votre organisation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Pourquoi choisir KnowledgeHub ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Notre plateforme offre une solution complète pour gérer,
                partager et enrichir les connaissances de votre organisation de
                manière collaborative et intelligente.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <BookOpen className="h-24 w-24 mx-auto mb-6 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">Prêt à commencer ?</h3>
                  <p className="opacity-80 mb-6">
                    Rejoignez des centaines d'équipes qui utilisent déjà
                    KnowledgeHub
                  </p>
                  <Link href="/auth/signup">
                    <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                      Créer un compte gratuit
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                KnowledgeHub
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 KnowledgeHub. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}