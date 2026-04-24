import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import OnboardingPayment from "@/pages/OnboardingPayment";
import ResetPassword from "@/pages/ResetPassword";
import Signup from "@/pages/Signup";
import Transactions from "@/pages/Transactions";
import NewDeal from "@/pages/NewDeal";
import DealDetail from "@/pages/DealDetail";
// import FormEditor from "@/pages/FormEditor";
import MarketingEditor from "@/pages/MarketingEditor";
import SignDocument from "@/pages/SignDocument";
import People from "@/pages/People";
import Tasks from "@/pages/Tasks";
import Inbox from "@/pages/Inbox";
import Listings from "@/pages/Listings";
import CalendarPage from "@/pages/Calendar";
import Finances from "@/pages/Finances";
import Referral from "@/pages/Referral";
import ContactBrokerage from "@/pages/ContactBrokerage";
import AdminPdfEditor from "@/pages/AdminPdfEditor";
import AffiliateLinks from "@/pages/AffiliateLinks";
import Profile from "@/pages/Profile";
// import SigningSessions from "@/pages/SigningSessions";
// import SigningSessionSetup from "@/pages/SigningSessionSetup";
// import SigningSessionPrepare from "@/pages/SigningSessionPrepare";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <AppErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sign/:token" element={<SignDocument />} />
          {/* Paywall route (auth required but no active subscription needed) */}
          <Route path="/onboarding/payment" element={<ProtectedRoute><OnboardingPayment /></ProtectedRoute>} />
          {/* Protected app routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<NewDeal />} />
            <Route path="/transactions/:id" element={<DealDetail />} />
            {/* Form editor and signing flows are paused while checklist work stays manual-only. */}
            {/* <Route path="/transactions/:id/form/:formId" element={<FormEditor />} /> */}
            <Route path="/transactions/:id/marketing" element={<MarketingEditor />} />
            {/* <Route path="/transactions/:id/signing-sessions" element={<SigningSessions />} /> */}
            {/* <Route path="/transactions/:id/signing-session/:sessionId/setup" element={<SigningSessionSetup />} /> */}
            {/* <Route path="/transactions/:id/signing-session/:sessionId/prepare" element={<SigningSessionPrepare />} /> */}
            <Route path="/people" element={<People />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/contact-brokerage" element={<ContactBrokerage />} />
            <Route path="/admin/pdf-editor" element={<AdminPdfEditor />} />
            <Route path="/admin/pdf-editor/:documentId" element={<AdminPdfEditor />} />
            <Route path="/affiliate-links" element={<AffiliateLinks />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
