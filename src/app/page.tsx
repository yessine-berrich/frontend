// src/app/page.tsx
'use client';

import Link from 'next/link';
import Background3D from '@/components/ParticleWaveBackground';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function SimpleHomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* 3D Background */}
      <Background3D />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto text-white">
        {/* Welcome Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8 animate-float backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">
            Welcome to TailAdmin
          </span>
        </div>
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Modern Dashboard
          <span className="text-white block mt-2">Reimagined</span>
        </h1>
        
        {/* Description */}
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Experience the future of admin dashboards with our stunning 3D interface, 
          glassmorphism effects, and seamless user experience.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/signin"
            className="bg-white text-gray-900 hover:bg-white/90 inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 group shadow-lg"
          >
            <span>Sign In</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 text-lg font-medium border border-white/30 rounded-lg text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
          >
            Create Account
          </Link>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-2">3D Effects</h3>
            <p className="text-white/70">Immersive animated background</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-2">Modern Design</h3>
            <p className="text-white/70">Glassmorphism & dark mode</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-2">Fast & Secure</h3>
            <p className="text-white/70">Optimized performance</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} TailAdmin • All rights reserved
        </p>
      </div>
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse-glow"></div>
    </div>
  );
}