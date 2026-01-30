// app/(auth)/signup/page.tsx
import AuroraBackground from '@/components/ParticleWaveBackground';
import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignUp Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js SignUp Page TailAdmin Dashboard Template",
};

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AuroraBackground />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Utiliser un effet de verre plus opaque en mode sombre */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-800/50">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}