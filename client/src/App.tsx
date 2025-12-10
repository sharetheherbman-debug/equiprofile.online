import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Horses from "./pages/Horses";
import HorseForm from "./pages/HorseForm";
import HorseDetail from "./pages/HorseDetail";
import Health from "./pages/Health";
import Training from "./pages/Training";
import Feeding from "./pages/Feeding";
import Weather from "./pages/Weather";
import Documents from "./pages/Documents";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      {/* Public landing page */}
      <Route path="/" component={Home} />
      
      {/* Dashboard - requires auth */}
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Horse management */}
      <Route path="/horses" component={Horses} />
      <Route path="/horses/new" component={HorseForm} />
      <Route path="/horses/:id/edit" component={HorseForm} />
      <Route path="/horses/:id" component={HorseDetail} />
      
      {/* Health records */}
      <Route path="/health" component={Health} />
      
      {/* Training */}
      <Route path="/training" component={Training} />
      
      {/* Feeding plans */}
      <Route path="/feeding" component={Feeding} />
      
      {/* Weather */}
      <Route path="/weather" component={Weather} />
      
      {/* Documents */}
      <Route path="/documents" component={Documents} />
      
      {/* Admin panel - requires admin role */}
      <Route path="/admin" component={Admin} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
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
