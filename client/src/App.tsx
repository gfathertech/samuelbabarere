import { Switch, Route, useLocation, useRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Home from "@/pages/Home";
import Documents from "@/pages/Documents";
import Preview from "@/pages/Preview";
import SharedDocument from "@/pages/SharedDocument";
import { BASE_URL } from "./config";

// When using routes with the GitHub Pages base path, we need this wrapper
// that adjusts all route paths to include the base path in production
function RouterWithBasePath() {
  // Only create a custom router when we have a non-root base path
  if (BASE_URL === '/') {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/documents" component={Documents} />
        <Route path="/preview/:id" component={Preview} />
        <Route path="/shared/:token" component={SharedDocument} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Use a different approach for GitHub Pages with basepath
  return (
    <div>
      <Route path={`${BASE_URL}`} component={Home} />
      <Route path={`${BASE_URL}documents`} component={Documents} />
      <Route path={`${BASE_URL}preview/:id`} component={Preview} />
      <Route path={`${BASE_URL}shared/:token`} component={SharedDocument} />
      <Route path={`${BASE_URL}*`} component={NotFound} />
    </div>
  );
}

function App() {
  const [location] = useLocation();
  // Adjust showNavbar logic to work with both development and GitHub Pages paths
  const isHomePage = location === "/" || location === BASE_URL || location === BASE_URL.slice(0, -1);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Seo />
        {isHomePage && <Navbar />}
        <RouterWithBasePath />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;