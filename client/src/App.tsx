import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SkipToContent, useKeyboardNavigation } from "./components/AccessibilityHelpers";
import "./i18n/config";

// Marketing Pages (Public)
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// App Pages (Protected)
import Dashboard from "./pages/Dashboard";
import Horses from "./pages/Horses";
import HorseForm from "./pages/HorseForm";
import HorseDetail from "./pages/HorseDetail";
import Health from "./pages/Health";
import Training from "./pages/Training";
import Feeding from "./pages/Feeding";
import Weather from "./pages/Weather";
import Documents from "./pages/Documents";
import Tasks from "./pages/Tasks";
import Contacts from "./pages/Contacts";
import Admin from "./pages/Admin";
import Stable from "./pages/Stable";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import AIChat from "./pages/AIChat";
import TrainingTemplates from "./pages/TrainingTemplates";
import BreedingManagement from "./pages/BreedingManagement";
import LessonScheduling from "./pages/LessonScheduling";
import ClientPortal from "./pages/ClientPortal";
import Settings from "./pages/Settings";
import BillingPage from "./pages/BillingPage";

function Router() {
  useKeyboardNavigation();
  
  return (
    <>
      <SkipToContent />
      <main id="main-content">
        <Switch>
          {/* Marketing Pages (Public) */}
          <Route path="/" component={Home} />
          <Route path="/features" component={Features} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/privacy" component={PrivacyPage} />
          
          {/* Auth Pages */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          
          {/* Dashboard - requires auth */}
          {/* App Pages (Protected - require auth) */}
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
          
          {/* Training Templates */}
          <Route path="/training-templates" component={TrainingTemplates} />
          
          {/* Breeding Management */}
          <Route path="/breeding" component={BreedingManagement} />
          
          {/* Lesson Scheduling */}
          <Route path="/lessons" component={LessonScheduling} />
          
          {/* Feeding plans */}
          <Route path="/feeding" component={Feeding} />
          
          {/* Weather */}
          <Route path="/weather" component={Weather} />
          
          {/* Documents */}
          <Route path="/documents" component={Documents} />
          
          {/* Tasks */}
          <Route path="/tasks" component={Tasks} />
          
          {/* Contacts */}
          <Route path="/contacts" component={Contacts} />
          
          {/* Stable Management */}
          <Route path="/stable" component={Stable} />
          
          {/* Messaging */}
          <Route path="/messages" component={Messages} />
          
          {/* Analytics */}
          <Route path="/analytics" component={Analytics} />
          
          {/* Reports */}
          <Route path="/reports" component={Reports} />
          
          {/* Calendar */}
          <Route path="/calendar" component={Calendar} />
          
          {/* Settings */}
          <Route path="/settings" component={Settings} />
          
          {/* Billing */}
          <Route path="/billing" component={BillingPage} />
          
          {/* AI Chat */}
          <Route path="/ai-chat" component={AIChat} />
          
          {/* Client Portal */}
          <Route path="/client/:clientId" component={ClientPortal} />
          
          {/* Admin panel - requires admin role */}
          <Route path="/admin" component={Admin} />
          
          {/* 404 */}
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
