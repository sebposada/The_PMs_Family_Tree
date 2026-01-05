import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Pending from "./pages/Pending";
import Directory from "./pages/Directory";
import PersonDetail from "./pages/PersonDetail";
import Tree from "./pages/Tree";
import Photos from "./pages/Photos";
import About from "./pages/About";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/pending" component={Pending} />
      <Route path="/directory" component={Directory} />
      <Route path="/people/:id" component={PersonDetail} />
      <Route path="/tree" component={Tree} />
      <Route path="/photos" component={Photos} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
