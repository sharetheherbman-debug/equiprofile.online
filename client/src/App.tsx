// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  SkipToContent,
  useKeyboardNavigation,
} from "./components/AccessibilityHelpers";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { UpgradeModal } from "./components/UpgradeModal";
import { useUpgradeModal } from "./hooks/useUpgradeModal";
import { ProtectedRoute, StableRoute } from "./components/ProtectedRoute";
import { SalesChatWidget } from "./components/SalesChatWidget";
import { CookieConsent } from "./components/CookieConsent";
import "./i18n/config";

// Marketing Pages (Public) — kept eager for fast initial paint on public routes
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Auth Pages — kept eager so login/register loads instantly
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// App Pages (Protected) — lazy-loaded to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Horses = lazy(() => import("./pages/Horses"));
const HorseForm = lazy(() => import("./pages/HorseForm"));
const HorseDetail = lazy(() => import("./pages/HorseDetail"));
const Health = lazy(() => import("./pages/Health"));
const Training = lazy(() => import("./pages/Training"));
const Feeding = lazy(() => import("./pages/Feeding"));
const Weather = lazy(() => import("./pages/Weather"));
const Documents = lazy(() => import("./pages/Documents"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Admin = lazy(() => import("./pages/Admin"));
const QAChecklist = lazy(() => import("./pages/QAChecklist"));
const Stable = lazy(() => import("./pages/Stable"));
const StableDashboard = lazy(() => import("./pages/StableDashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const Calendar = lazy(() => import("./pages/Calendar"));
const AIChat = lazy(() => import("./pages/AIChat"));
const TrainingTemplates = lazy(() => import("./pages/TrainingTemplates"));
const BreedingManagement = lazy(() => import("./pages/BreedingManagement"));
const LessonScheduling = lazy(() => import("./pages/LessonScheduling"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const Settings = lazy(() => import("./pages/Settings"));
const BillingPage = lazy(() => import("./pages/BillingPage"));

// Additional Health & Management Pages
const Appointments = lazy(() => import("./pages/Appointments"));
const NutritionLogs = lazy(() => import("./pages/NutritionLogs"));
const NutritionPlans = lazy(() => import("./pages/NutritionPlans"));
const Hoofcare = lazy(() => import("./pages/Hoofcare"));
const Pedigree = lazy(() => import("./pages/Pedigree"));
const Xrays = lazy(() => import("./pages/Xrays"));
const Treatments = lazy(() => import("./pages/Treatments"));
const Vaccinations = lazy(() => import("./pages/Vaccinations"));
const DentalCare = lazy(() => import("./pages/DentalCare"));
const Dewormings = lazy(() => import("./pages/Dewormings"));
const Tags = lazy(() => import("./pages/Tags"));

// Minimal spinner shown while lazy chunks load (doesn't block FCP)
function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  useKeyboardNavigation();
  useScrollToTop();
  const upgradeModal = useUpgradeModal();

  return (
    <>
      <SkipToContent />
      <UpgradeModal
        open={upgradeModal.isOpen}
        onClose={upgradeModal.close}
        reason={upgradeModal.reason}
        message={upgradeModal.message}
      />
      <main id="main-content">
        <Suspense fallback={<PageSpinner />}>
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

            {/* App Pages (Protected - require auth) */}
            <Route path="/dashboard">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>

            {/* Horse management */}
            <Route path="/horses">
              <ProtectedRoute>
                <Horses />
              </ProtectedRoute>
            </Route>
            <Route path="/horses/new">
              <ProtectedRoute>
                <HorseForm />
              </ProtectedRoute>
            </Route>
            <Route path="/horses/:id/edit">
              <ProtectedRoute>
                <HorseForm />
              </ProtectedRoute>
            </Route>
            <Route path="/horses/:id">
              <ProtectedRoute>
                <HorseDetail />
              </ProtectedRoute>
            </Route>

            {/* Health records */}
            <Route path="/health">
              <ProtectedRoute>
                <Health />
              </ProtectedRoute>
            </Route>
            <Route path="/vaccinations">
              <ProtectedRoute>
                <Vaccinations />
              </ProtectedRoute>
            </Route>
            <Route path="/dental">
              <ProtectedRoute>
                <DentalCare />
              </ProtectedRoute>
            </Route>
            <Route path="/hoofcare">
              <ProtectedRoute>
                <Hoofcare />
              </ProtectedRoute>
            </Route>
            <Route path="/dewormings">
              <ProtectedRoute>
                <Dewormings />
              </ProtectedRoute>
            </Route>
            <Route path="/treatments">
              <ProtectedRoute>
                <Treatments />
              </ProtectedRoute>
            </Route>
            <Route path="/xrays">
              <ProtectedRoute>
                <Xrays />
              </ProtectedRoute>
            </Route>

            {/* Pedigree */}
            <Route path="/pedigree">
              <ProtectedRoute>
                <Pedigree />
              </ProtectedRoute>
            </Route>

            {/* Training */}
            <Route path="/training">
              <ProtectedRoute>
                <Training />
              </ProtectedRoute>
            </Route>
            <Route path="/training-templates">
              <ProtectedRoute>
                <TrainingTemplates />
              </ProtectedRoute>
            </Route>

            {/* Breeding Management */}
            <Route path="/breeding">
              <StableRoute>
                <BreedingManagement />
              </StableRoute>
            </Route>

            {/* Lesson Scheduling */}
            <Route path="/lessons">
              <StableRoute>
                <LessonScheduling />
              </StableRoute>
            </Route>

            {/* Feeding plans */}
            <Route path="/feeding">
              <ProtectedRoute>
                <Feeding />
              </ProtectedRoute>
            </Route>
            <Route path="/nutrition-plans">
              <ProtectedRoute>
                <NutritionPlans />
              </ProtectedRoute>
            </Route>
            <Route path="/nutrition-logs">
              <ProtectedRoute>
                <NutritionLogs />
              </ProtectedRoute>
            </Route>

            {/* Weather */}
            <Route path="/weather">
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            </Route>

            {/* Documents */}
            <Route path="/documents">
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            </Route>

            {/* Tasks */}
            <Route path="/tasks">
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            </Route>

            {/* Contacts */}
            <Route path="/contacts">
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            </Route>

            {/* Stable Management */}
            <Route path="/stable">
              <StableRoute>
                <Stable />
              </StableRoute>
            </Route>

            {/* Stable Dashboard (Stable plan users) */}
            <Route path="/stable-dashboard">
              <StableRoute>
                <StableDashboard />
              </StableRoute>
            </Route>

            {/* Messaging */}
            <Route path="/messages">
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            </Route>

            {/* Analytics */}
            <Route path="/analytics">
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            </Route>

            {/* Reports */}
            <Route path="/reports">
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            </Route>

            {/* Calendar */}
            <Route path="/calendar">
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            </Route>
            <Route path="/appointments">
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            </Route>

            {/* Tags */}
            <Route path="/tags">
              <ProtectedRoute>
                <Tags />
              </ProtectedRoute>
            </Route>

            {/* Settings */}
            <Route path="/settings">
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </Route>

            {/* Billing */}
            <Route path="/billing">
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            </Route>

            {/* AI Chat */}
            <Route path="/ai-chat">
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            </Route>

            {/* Client Portal */}
            <Route path="/client/:clientId" component={ClientPortal} />

            {/* Admin panel - accessible to any user with admin session unlocked */}
            <Route path="/admin">
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            </Route>

            {/* QA Checklist - admin-unlocked users only */}
            <Route path="/qa-check">
              <ProtectedRoute>
                <QAChecklist />
              </ProtectedRoute>
            </Route>

            {/* 404 */}
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <SalesChatWidget />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
