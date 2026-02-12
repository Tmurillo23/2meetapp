import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-y-hidden flex flex-col items-center relative text-foreground">
      
      {/* Header */}
      <nav className="w-full flex justify-center h-16 bg-white/35 shadow-sm z-10 backdrop-blur-md"> 
        <div className="w-full max-w-6xl flex justify-between items-center px-6 text-sm font-semibold"> 
          <p className="text-xl text-purple-700">2Meet</p> 
          <div className="flex gap-4"> 
            <Link href="/auth/login">
              <button className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"> 
                Sign In 
              </button> 
            </Link> 
            <Link href="/auth/sign-up">
              <button className="px-4 py-2 rounded-md bg-white/90 border border-purple-600 text-purple-600 hover:bg-purple-50 transition"> 
                Sign Up 
              </button> 
            </Link> 
          </div> 
        </div> 
      </nav>

      {/* Imagen centrada y un poco encima del nav */}
      <div className="h-full flex justify-center  overflow-y-hidden">
        <Image 
          src="/images/fondo1.png" 
          alt="Fondo"
          fill 
          className=" opacity-85 min-h-screen overflow-y-hidden mt-6"
        />
      </div>
    </main>
  );
}
