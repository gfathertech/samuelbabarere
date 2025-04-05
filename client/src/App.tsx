import { Switch, Route, useLocation } from "wouter";
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

function App() {
  const [location] = useLocation();
  const isHomePage = location === "/";
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Seo />
        {isHomePage && <Navbar />}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/documents" component={Documents} />
          <Route path="/preview/:id" component={Preview} />
          <Route path="/shared/:token" component={SharedDocument} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;