import Sidebar from "@/components/Sidebar";
import NeuralHub from "@/components/NeuralHub";
import ThoughtStream from "@/components/ThoughtStream";
import { Zap, Shield, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Visual background noise/texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <Sidebar />

      <main className="flex-1 flex relative overflow-hidden">
        {/* Central Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8">
          <NeuralHub />

          <div className="mt-12 text-center max-w-xl">
            <h2 className="text-4xl font-light tracking-tight mb-4">
              Intelligence in <span className="text-primary glow-primary font-normal">Aether</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your proactive personal agent is active and monitoring your workspace.
              Currently connected to Gemini 3 Flash-preview.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { icon: Shield, label: "Private Core", val: "Llama 3 Ready" },
                { icon: Zap, label: "Proactivity", val: "High" },
                { icon: Cpu, label: "Memory", val: "842 Nodes" },
              ].map((stat, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex flex-col items-center gap-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold">{stat.val}</p>
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
