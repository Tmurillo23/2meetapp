import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Imagen izquierda */}
      <div className="hidden md:block fixed left-0 top-1/2 -translate-y-1/2 z-0">
      {/* <div className ="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12"> */}
        <Image
          src="/images/left.png"
          alt="Imagen izquierda"
          width={300}
          height={400}
          className='hidden md:block'
          // className="object-contain opacity-80"
        />
      </div>

      {/* Imagen derecha */}
      <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-0">
        <Image
          src="/images/right.png"
          alt="Imagen derecha"
          width={300}
          height={400}
          className="object-contain opacity-80"
        />
      </div>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <p>2Meet </p>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-2xl lg:max-w-xl p-5">
          <Hero /> 
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Siempre será una buena opción
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
