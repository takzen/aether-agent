import Sidebar from "@/components/Sidebar";
import NeuralHub from "@/components/NeuralHub";
import ThoughtStream from "@/components/ThoughtStream";
import { Zap, Shield, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      </div>

      <Sidebar />

      <main className="flex-1 flex relative overflow-hidden">
        {/* Central Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8">
          <NeuralHub />

          <div className="mt-12 text-center max-w-xl z-20">
            <h2 className="text-5xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              SYSTEM ONLINE
            </h2>
            <p className="text-neutral-400 leading-relaxed text-lg font-light">
              Neural core active and monitoring. <br /> Aether represents your second brain.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { icon: Shield, label: "Encryption", val: "AES-256" },
                { icon: Zap, label: "Latency", val: "12ms" },
                { icon: Cpu, label: "Memory", val: "1.2 TB" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-3 backdrop-blur-md">
                  <stat.icon className="w-5 h-5 text-white/80" />
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">{stat.label}</p>
                  <p className="text-sm font-bold text-white">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ThoughtStream />
      </main>
    </div>
  );
}
