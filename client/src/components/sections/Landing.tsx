import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SiInstagram, SiLinkedin, SiFacebook, SiMedium } from "react-icons/si";

const socialLinks = [
  { icon: SiInstagram, href: "https://www.instagram.com/samuelbabarere?igsh=YzljYTk1ODg3Zg==", label: "Instagram" },
  { icon: SiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: SiFacebook, href: "https://facebook.com", label: "Facebook" },
  { icon: SiMedium, href: "https://medium.com/@babareresamuel1", label: "Medium" },
];

export default function Landing() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-200/30 to-transparent dark:from-purple-900/20 pointer-events-none" />

      {/* Profile image */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6"
      >
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-pink-400/50 shadow-xl backdrop-blur-sm">
          <img
            src="https://i.ibb.co/mVXMr0BR/5b9e480b133b009e.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Neon glow effect */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_40px_10px_rgba(236,72,153,0.3)]" />
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center"
      >
        Babarere Samuel
      </motion.h1>

      {/* Badges */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex gap-2 mb-4"
      >
        <Badge variant="secondary" className="bg-pink-500/10 text-pink-700 border-pink-300/50 backdrop-blur-sm">
          Nursing Student 
        </Badge>
        <Badge variant="secondary" className="bg-pink-500/10 text-pink-700 border-pink-300/50 backdrop-blur-sm">
          Tech Enthusiast
        </Badge>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-base text-gray-600 dark:text-purple-100 max-w-md text-center leading-relaxed mb-8 dark:text-opacity-90"
      >
    Hello, I'm Samuel, a nursing student passionate about technology and caring for others. I'm driven to provide compassionate care and explore technology's possibilities. As a lifelong learner, I value meaningful connections and seek knowledge through others. I'm approachable and easy-going, looking forward to learning and growing with others.
      </motion.p>

      {/* Social Links */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex gap-6"
      >
        {socialLinks.map((social) => (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="text-pink-600 hover:text-pink-700 transition-colors"
          >
            <social.icon className="w-6 h-6" />
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}