import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { BASE_URL } from "../config";

// Helper to prepend BASE_URL to links in production
const getPath = (path: string) => {
  // Handle base path for GitHub Pages
  if (path === '/') return BASE_URL;
  return `${BASE_URL}${path.startsWith('/') ? path.substring(1) : path}`;
};

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-600/10 backdrop-blur-md border-b border-purple-300/20 dark:bg-purple-900/20 dark:border-purple-500/20 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={getPath('/')} className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors dark:text-purple-300 dark:hover:text-pink-300 glow-effect group">
          <span className="relative">
            B.S~(SOG)
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link href={getPath('/documents')} className="px-3 py-2 text-sm rounded-full bg-white/5 dark:bg-purple-900/30 text-gray-700 hover:text-purple-600 dark:text-purple-200 dark:hover:text-pink-300 transition-all hover:bg-white/10 dark:hover:bg-purple-800/40 border border-transparent dark:border-purple-500/20 hover:border-purple-300/20 dark:hover:border-purple-400/30 shadow-sm">
            <span className="drop-shadow-sm">Documents</span>
          </Link>
          <div className="floating">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </nav>
  );
}