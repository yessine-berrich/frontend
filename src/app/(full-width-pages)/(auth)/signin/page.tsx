import ParticleWaveBackground from '@/components/ParticleWaveBackground';
import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <ParticleWaveBackground />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Ajoutez un conteneur pour mieux intégrer le formulaire */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}