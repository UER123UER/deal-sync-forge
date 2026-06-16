import React from "react";
import type { RouteRecord } from "vite-react-ssg";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import RootLayout from "@/RootLayout";
import { caseStudies } from "@/data/caseStudies";

// Public marketing pages — eager so they render with full HTML at SSG time
// without async boundaries.
import Index from "@/pages/Index";
import WhyUs from "@/pages/WhyUs";
import CaseStudies from "@/pages/CaseStudies";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import CommissionCalculator from "@/pages/CommissionCalculator";
import Auth from "@/pages/Auth";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";

// react-router data-router `lazy` expects { Component, loader, ... }.
// Most of our page modules `export default`, so adapt.
const lazyDefault =
  (loader: () => Promise<{ default: React.ComponentType<unknown> }>) =>
  async () => ({ Component: (await loader()).default });

const protectedLazy =
  (loader: () => Promise<{ default: React.ComponentType<unknown> }>) =>
  async () => {
    const Page = (await loader()).default;
    const Wrapped: React.FC = () => (
      <ProtectedRoute>
        <Page />
      </ProtectedRoute>
    );
    return { Component: Wrapped };
  };

const caseStudyStaticPaths = () =>
  caseStudies.map((c) => `/case-studies/${c.slug}`);

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // ---------- Public, pre-rendered for SEO ----------
      { index: true, element: <Index />, entry: "src/pages/Index.tsx" },
      { path: "why-us", element: <WhyUs />, entry: "src/pages/WhyUs.tsx" },
      {
        path: "case-studies",
        element: <CaseStudies />,
        entry: "src/pages/CaseStudies.tsx",
      },
      {
        path: "case-studies/:slug",
        element: <CaseStudyDetail />,
        entry: "src/pages/CaseStudyDetail.tsx",
        getStaticPaths: caseStudyStaticPaths,
      },
      { path: "auth", element: <Auth />, entry: "src/pages/Auth.tsx" },
      { path: "signup", element: <Signup />, entry: "src/pages/Signup.tsx" },
      {
        path: "commission-calculator",
        element: <CommissionCalculator />,
        entry: "src/pages/CommissionCalculator.tsx",
      },

      // ---------- Public but client-only (dynamic tokens / session) ----------
      {
        path: "reset-password",
        lazy: lazyDefault(() => import("@/pages/ResetPassword")),
      },
      {
        path: "sign/:token",
        lazy: lazyDefault(() => import("@/pages/SignDocument")),
      },

      // ---------- Onboarding (auth required) ----------
      {
        path: "onboarding/agreement",
        lazy: protectedLazy(() => import("@/pages/OnboardingAgreement")),
      },
      {
        path: "onboarding/billing",
        lazy: protectedLazy(() => import("@/pages/OnboardingBilling")),
      },
      {
        path: "onboarding/deposit",
        lazy: protectedLazy(() => import("@/pages/OnboardingDeposit")),
      },
      {
        path: "onboarding/payment",
        lazy: protectedLazy(() => import("@/pages/OnboardingPayment")),
      },

      // ---------- Protected app shell ----------
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "transactions", lazy: lazyDefault(() => import("@/pages/Transactions")) },
          { path: "transactions/new", lazy: lazyDefault(() => import("@/pages/NewDeal")) },
          { path: "transactions/:id", lazy: lazyDefault(() => import("@/pages/DealDetail")) },
          { path: "transactions/:id/marketing", lazy: lazyDefault(() => import("@/pages/MarketingEditor")) },
          { path: "people", lazy: lazyDefault(() => import("@/pages/People")) },
          { path: "tasks", lazy: lazyDefault(() => import("@/pages/Tasks")) },
          { path: "inbox", lazy: lazyDefault(() => import("@/pages/Inbox")) },
          { path: "listings", lazy: lazyDefault(() => import("@/pages/Listings")) },
          { path: "calendar", lazy: lazyDefault(() => import("@/pages/Calendar")) },
          { path: "finances", lazy: lazyDefault(() => import("@/pages/Finances")) },
          { path: "referral", lazy: lazyDefault(() => import("@/pages/Referral")) },
          { path: "contact-brokerage", lazy: lazyDefault(() => import("@/pages/ContactBrokerage")) },
          { path: "admin/pdf-editor", lazy: lazyDefault(() => import("@/pages/AdminPdfEditor")) },
          { path: "admin/pdf-editor/:documentId", lazy: lazyDefault(() => import("@/pages/AdminPdfEditor")) },
          { path: "affiliate-links", lazy: lazyDefault(() => import("@/pages/AffiliateLinks")) },
          { path: "profile", lazy: lazyDefault(() => import("@/pages/Profile")) },
        ],
      },

      // ---------- 404 ----------
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;