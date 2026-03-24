import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Transactions from "@/pages/Transactions";
import NewDeal from "@/pages/NewDeal";
import DealDetail from "@/pages/DealDetail";
import FormEditor from "@/pages/FormEditor";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/transactions" replace />} />
          <Route path="/sign/:token" element={<SignDocument />} />
          <Route element={<AppLayout />}>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<NewDeal />} />
            <Route path="/transactions/:id" element={<DealDetail />} />
            <Route path="/transactions/:id/form/:formId" element={<FormEditor />} />
            <Route path="/transactions/:id/marketing" element={<MarketingEditor />} />
            <Route path="/people" element={<People />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/listings" element={<Listings />} />
            
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/finances" element={<Finances />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
