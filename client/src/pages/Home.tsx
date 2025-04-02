import { motion } from "framer-motion";
import Landing from "@/components/sections/Landing";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background relative pt-16"
    >
      {/* Global pink overlay */}
      <div className="fixed inset-0 bg-pink-500/20 pointer-events-none backdrop-blur-[2px] z-0" />

      {/* Content */}
      <div className="relative z-10">
        <Landing />
        <Skills />
        <Projects />
        <Contact />
      </div>
    </motion.main>
  );
}