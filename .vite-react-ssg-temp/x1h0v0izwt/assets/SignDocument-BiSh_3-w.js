import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { s as supabase, c as cn, S as SeoHead, B as Button } from "../main.mjs";
import { D as Dialog, a as DialogContent } from "./dialog-BhAZyUdo.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Check, Type, Pen, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as pdfjsLib from "pdfjs-dist";
import "vite-react-ssg";
import "@supabase/supabase-js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
function useSignatureRequestByToken(token) {
  return useQuery({
    queryKey: ["signature_request_token", token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase.from("signature_requests").select("*, signature_recipients(*)").eq("token", token).single();
      if (error) throw error;
      return data;
    }
  });
}
function useSignDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipientId, signatureData }) => {
      const { error } = await supabase.from("signature_recipients").update({ status: "signed", signed_at: (/* @__PURE__ */ new Date()).toISOString(), signature_data: signatureData }).eq("id", recipientId);
      if (error) throw error;
      const { data: recipient } = await supabase.from("signature_recipients").select("signature_request_id").eq("id", recipientId).single();
      if (recipient) {
        const { data: allRecipients } = await supabase.from("signature_recipients").select("status").eq("signature_request_id", recipient.signature_request_id);
        const allSigned = allRecipients == null ? void 0 : allRecipients.every((r) => r.status === "signed");
        if (allSigned) {
          await supabase.from("signature_requests").update({ status: "signed" }).eq("id", recipient.signature_request_id);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["signature_requests"] });
      qc.invalidateQueries({ queryKey: ["signature_request_token"] });
    }
  });
}
const isFunctionMissingError = (error) => {
  if (!error || typeof error !== "object") return false;
  const values = Object.values(error).filter((value) => typeof value === "string").join(" ").toLowerCase();
  return values.includes("function") && (values.includes("not found") || values.includes("404") || values.includes("does not exist"));
};
async function fetchSigningSessionByToken(token) {
  let functionError = null;
  const { data: functionData, error: invokeError } = await supabase.functions.invoke(
    "get-signing-session",
    {
      body: { token }
    }
  );
  if (!invokeError && functionData) {
    return functionData;
  }
  functionError = invokeError;
  const { data: recipient, error: recipientError } = await supabase.from("session_recipients").select("*").eq("token", token).maybeSingle();
  if (recipientError) throw recipientError;
  if (!recipient) return null;
  const { data: session, error: sessionError } = await supabase.from("signing_sessions").select("*").eq("id", recipient.session_id).single();
  if (sessionError) throw sessionError;
  const { data: fields, error: fieldsError } = await supabase.from("session_fields").select("*").eq("session_id", recipient.session_id);
  if (fieldsError) {
    if (functionError && !isFunctionMissingError(functionError)) {
      throw functionError;
    }
    throw fieldsError;
  }
  const { data: documents, error: documentsError } = await supabase.from("session_documents").select("*").eq("session_id", recipient.session_id).order("sort_order");
  if (documentsError) throw documentsError;
  return {
    session,
    recipient,
    fields: fields || [],
    documents: documents || []
  };
}
function useSessionByToken(token) {
  return useQuery({
    queryKey: ["session_by_token", token],
    enabled: !!token,
    queryFn: async () => fetchSigningSessionByToken(token)
  });
}
const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className),
    ...props,
    children: /* @__PURE__ */ jsxDEV(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/components/ui/progress.tsx",
        lineNumber: 15,
        columnNumber: 5
      },
      void 0
    )
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/progress.tsx",
    lineNumber: 10,
    columnNumber: 3
  },
  void 0
));
Progress.displayName = ProgressPrimitive.Root.displayName;
const DEFAULT_FIELDS = {
  sellerName: "",
  brokerName: "",
  brokerCompany: "",
  propertyAddress: "",
  legalDescription: "",
  personalProperty: "",
  occupancyStatus: "is not",
  tenantLeaseExpiry: "",
  listingStartDate: "",
  listingExpiration: "",
  listPrice: "",
  financingTerms: "",
  sellerFinancingAmount: "",
  sellerFinancingTerms: "",
  assumptionAmount: "",
  assumptionFee: "",
  assumptionTermYears: "",
  assumptionStartYear: "",
  assumptionRate: "",
  assumptionRateType: "",
  sellerExpensePercent: "",
  sellerExpenseAmount: "",
  commissionPercent: "",
  commissionFlat: "",
  optionFee: "",
  leaseFee: "",
  protectionPeriodDays: "",
  retainedDepositPercent: "50",
  buyerBrokerCompPercent: "",
  buyerBrokerCompFlat: "",
  cancellationFee: "",
  additionalTerms: "",
  mlsNumber: "",
  sellerPhone: "",
  sellerWorkPhone: "",
  sellerFax: "",
  sellerAddress: "",
  sellerEmail: "",
  brokerPhone: "",
  brokerAddress: ""
};
function ListingAgreementDocument({ fields, renderField, signatureSection }) {
  return /* @__PURE__ */ jsxDEV("div", { style: { fontFamily: 'Georgia, "Times New Roman", serif' }, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "text-right text-xs text-muted-foreground mb-4", style: { fontFamily: "sans-serif" }, children: /* @__PURE__ */ jsxDEV("span", { className: "italic", children: "Florida Realtors®" }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
      lineNumber: 100,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
      lineNumber: 99,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("h2", { className: "text-center text-base font-bold mb-4 tracking-wide", children: "Exclusive Right of Sale Listing Agreement" }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
      lineNumber: 103,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mb-6 text-center", style: { fontFamily: "sans-serif" }, children: "THIS IS A LEGALLY BINDING CONTRACT. IF NOT UNDERSTOOD, SEEK LEGAL ADVICE." }, void 0, false, {
      fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
      lineNumber: 107,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "space-y-5 text-[13px] leading-relaxed", children: [
      /* @__PURE__ */ jsxDEV("p", { children: [
        'This Exclusive Right of Sale Listing Agreement ("Agreement") is between',
        " ",
        renderField("sellerName", 220),
        ' ("Seller") and brokerage',
        " ",
        renderField("brokerCompany", 220),
        ' ("Broker").'
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 113,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "1. Authority to Sell Property:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 121,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: [
          "Seller gives Broker the ",
          /* @__PURE__ */ jsxDEV("strong", { children: "EXCLUSIVE RIGHT TO SELL" }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 123,
            columnNumber: 37
          }, this),
          ' the real and personal property (collectively "Property") described below, at the price and terms described below, beginning',
          " ",
          renderField("listingStartDate", 130),
          " and terminating at 11:59 p.m. on",
          " ",
          renderField("listingExpiration", 130),
          ' ("Termination Date"). Upon full execution of a contract for sale and purchase of the Property, all rights and obligations of this Agreement will automatically extend through the date of the actual closing of the sales contract. Seller and Broker acknowledge that this Agreement does not guarantee a sale. This Property will be offered to any person without regard to race, color, religion, sex, handicap, familial status, national origin, or any other factor protected by federal, state, or local law. Seller certifies and represents that she/he/it is legally entitled to convey the Property and all improvements.'
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 122,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 120,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "2. Description of Property:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 138,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "(a) Street Address: ",
          renderField("propertyAddress", 400)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 139,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "Legal Description: ",
          renderField("legalDescription", 400)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 142,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "(b) Personal Property, including appliances: ",
          renderField("personalProperty", 300)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 145,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "(c) Occupancy: Property ",
          renderField("occupancyStatus", 60),
          " currently occupied by a tenant.",
          fields.occupancyStatus === "is" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
            " If occupied, the lease term expires ",
            renderField("tenantLeaseExpiry", 120),
            "."
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 151,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 148,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 137,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "3. Price and Terms:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 158,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: "The property is offered for sale on the following terms or on other terms acceptable to Seller:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 159,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "(a) Price: $",
          renderField("listPrice", 140)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 162,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "(b) Financing Terms: ",
          renderField("financingTerms", 300)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 165,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2 ml-4", children: [
          "Seller Financing: Seller will hold a purchase money mortgage in the amount of $",
          renderField("sellerFinancingAmount", 120),
          " ",
          "with the following terms: ",
          renderField("sellerFinancingTerms", 250)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 168,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2 ml-4", children: [
          "Assumption of Existing Mortgage: Buyer may assume existing mortgage for $",
          renderField("assumptionAmount", 120),
          " ",
          "plus an assumption fee of $",
          renderField("assumptionFee", 100),
          ". The mortgage is for a term of",
          " ",
          renderField("assumptionTermYears", 40),
          " years beginning in ",
          renderField("assumptionStartYear", 50),
          ",",
          " ",
          "at an interest rate of ",
          renderField("assumptionRate", 40),
          "% ",
          renderField("assumptionRateType", 80),
          "."
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 172,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2 text-xs text-muted-foreground ml-4", style: { fontFamily: "sans-serif" }, children: "Notice to Seller: (1) You may remain liable for an assumed mortgage for a number of years after the Property is sold. Check with your lender to determine the extent of your liability. (2) Extensive regulations affect Seller financed transactions. Consult with a legal or mortgage professional." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 178,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "(c) Seller Expenses: Seller will pay closing costs not to exceed ",
          renderField("sellerExpensePercent", 40),
          "% of the purchase price or $",
          renderField("sellerExpenseAmount", 120),
          ", and any other expenses Seller agrees to pay."
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 182,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 157,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "4. Broker Obligations:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 190,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: "Broker agrees to make diligent and continued efforts to sell the Property in accordance with this Agreement until a sales contract is pending on the Property. This includes, except when not in Seller's best interests, cooperating and communicating with other brokers and making the property available for showings." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 191,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 189,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-2 text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: [
        /* @__PURE__ */ jsxDEV("p", { children: "Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 1 of 6." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 200,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1", children: "ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 201,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 199,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "5. Multiple Listing Service:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 206,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: [
          'Placing the Property in a multiple listing service (the "MLS") is beneficial to Seller because the Property will be exposed to a large number of potential buyers. As a MLS participant, Broker is obligated to enter the Property into the MLS within one (1) business day of marketing the Property to the public or as necessary to comply with local MLS rule(s). Seller authorizes Broker to report to the MLS this listing information and price, terms, and financing information on any resulting sale for use by authorized Board/Association members and MLS participants and subscribers unless Seller directs Broker otherwise in writing. MLS# ',
          renderField("mlsNumber", 120),
          "."
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 207,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 205,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "6. Broker Authority:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 219,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: "Seller authorizes Broker to:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 220,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-2", children: [
          /* @__PURE__ */ jsxDEV("p", { children: "(a) Market the Property to the public, including flyers, yard signs, digital marketing on public facing websites, brokerage website displays, email blasts, multi-brokerage listing sharing networks." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 222,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(b) Place appropriate transaction signs on the Property." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 223,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(c) Use Seller's name in connection with marketing or advertising the Property." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 224,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(d) Obtain information relating to the present mortgage(s) on the Property." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 225,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(e) Provide objective comparative market analysis information to potential buyers." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 226,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(f) Use a lock box system to show and access the Property. A lock box does not ensure the Property's security. Seller is advised to secure or remove valuables." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 227,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 221,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 218,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "7. Seller Obligations:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 233,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: "In consideration of Broker's obligations, Seller agrees to:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 234,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-2", children: [
          /* @__PURE__ */ jsxDEV("p", { children: "(a) Cooperate with Broker in carrying out the purpose of this Agreement, including referring immediately to Broker all inquiries regarding the Property's transfer." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 236,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(b) Recognize Broker may be subject to additional MLS obligations and potential penalties for failure to comply." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 237,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(c) Provide Broker with keys to the Property and make the Property available for showings during reasonable times." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 238,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(d) Inform Broker before leasing, mortgaging, or otherwise encumbering the Property." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 239,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(e) Indemnify Broker and hold Broker harmless from losses, damages, costs, and expenses of any nature, including attorney's fees." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 240,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 235,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 232,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-2 text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: [
        /* @__PURE__ */ jsxDEV("p", { children: "Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 2 of 6." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 246,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1", children: "ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 247,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 245,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "8. Compensation:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 252,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: "Seller will compensate Broker as specified below for procuring a buyer who is ready, willing, and able to purchase the Property. Seller will pay Broker as follows (plus applicable sales tax):" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 253,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-2", children: [
          /* @__PURE__ */ jsxDEV("p", { children: [
            "(a) ",
            renderField("commissionPercent", 40),
            "% of the total purchase price plus $",
            renderField("commissionFlat", 100),
            ", no later than the date of closing specified in the sales contract. However, closing is not a prerequisite for Broker's fee being earned."
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 258,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "(b) ",
            renderField("optionFee", 60),
            " ($ or %) of the consideration paid for an option, at the time an option is created."
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 262,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "(c) ",
            renderField("leaseFee", 60),
            " ($ or %) of gross lease value as a leasing fee."
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 265,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(d) Broker's fee is due in the following circumstances:" }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 268,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-1 text-[12px]", children: [
            /* @__PURE__ */ jsxDEV("p", { children: "(1) If any interest in the Property is transferred, whether by sale, lease, exchange, governmental action, bankruptcy, or any other means of transfer." }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 270,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "(2) If Seller refuses or fails to sign an offer at the price and terms stated, defaults on an executed sales contract, or agrees to cancel." }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 271,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: [
              "(3) If, within ",
              renderField("protectionPeriodDays", 40),
              ' days after Termination Date ("Protection Period"), Seller transfers or contracts to transfer the Property to any prospects with whom Seller, Broker, or any licensee communicated before Termination Date.'
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 272,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 269,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "(e) Retained Deposits: Broker is entitled to receive ",
            renderField("retainedDepositPercent", 40),
            "% (50% if left blank) of all deposits that Seller retains as liquidated damages for a buyer's default, not to exceed the Paragraph 8(a) fee."
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 274,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "(f) Brokerage commissions are not set by law and are fully negotiable." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 278,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 257,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 251,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "9. Cooperation with and Compensation to Other Brokers:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 284,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: "Seller is advised and aware that Seller may, but is not required to, compensate a buyer's broker upon closing. Seller may choose to enter into a separate written agreement to pay buyer's broker or may approve Broker to pay buyer's broker in accordance with paragraph 10. Seller also understands:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 285,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-1 mt-2 text-[12px]", children: [
          /* @__PURE__ */ jsxDEV("p", { children: `(a) "Buyer's broker" may include this Broker if Broker also works with buyer on this transaction;` }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 291,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(b) If this occurs, Broker will be entitled to the compensation in paragraph 8 for Seller services, as well as the buyer's broker compensation in paragraph 10 for buyer services;" }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 292,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(c) Broker may receive separate compensation from buyer for services rendered to buyer by Broker." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 293,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 290,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 283,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-2 text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: [
        /* @__PURE__ */ jsxDEV("p", { children: "Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 3 of 6." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 299,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1", children: "ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 300,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 298,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "10. Compensation to Buyer Brokers:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 305,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2 text-xs text-muted-foreground", children: "Brokerage commissions are not set by law and are fully negotiable." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 306,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: "Seller approves the following:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 307,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-2", children: [
          /* @__PURE__ */ jsxDEV("p", { children: [
            "(a) Seller authorizes Broker to offer compensation to buyer's broker in the amount of:",
            " ",
            renderField("buyerBrokerCompPercent", 40),
            "% of the purchase price or $",
            renderField("buyerBrokerCompFlat", 100),
            ". This compensation will be set forth in a separate written agreement between Broker and buyer's broker."
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 309,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "(b) No compensation will be offered to buyer's broker." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 314,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 308,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 304,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "11. Brokerage Relationship:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 320,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold text-center my-2", children: "NO BROKERAGE RELATIONSHIP NOTICE" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 321,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs mb-2", children: "FLORIDA LAW REQUIRES THAT REAL ESTATE LICENSEES WHO HAVE NO BROKERAGE RELATIONSHIP WITH A POTENTIAL SELLER OR BUYER DISCLOSE THEIR DUTIES TO SELLERS AND BUYERS." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 322,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mb-2", children: [
          "As a real estate licensee who has no brokerage relationship with you,",
          " ",
          renderField("brokerName", 200),
          " and its associates owe to you the following duties:"
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 326,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "ml-4 space-y-1", children: [
          /* @__PURE__ */ jsxDEV("p", { children: "1. Dealing honestly and fairly;" }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 331,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "2. Disclosing all known facts that materially affect the value of residential real property which are not readily observable to the buyer;" }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 332,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "3. Accounting for all funds entrusted to the licensee." }, void 0, false, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 333,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 330,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 319,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "12. Conditional Termination:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 339,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: [
          "At Seller's request, Broker may agree to conditionally terminate this Agreement. If Broker agrees to conditional termination, Seller must sign a withdrawal agreement, reimburse Broker for all direct expenses incurred in marketing the Property, and pay a cancellation fee of $",
          renderField("cancellationFee", 100),
          " plus applicable sales tax."
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 340,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 338,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-2 text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: [
        /* @__PURE__ */ jsxDEV("p", { children: "Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 4 of 6." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 349,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1", children: "ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 350,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 348,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "13. Dispute Resolution:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 355,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: "This Agreement will be construed under Florida law. All controversies, claims, and other matters in question between the parties arising out of or relating to this Agreement or the breach thereof will be settled by first attempting mediation under the rules of the American Arbitration Association or other mediator agreed upon by the parties. If litigation arises out of this Agreement, the prevailing party will be entitled to recover reasonable attorney's fees and costs." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 356,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 354,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "14. Miscellaneous:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 366,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { children: "This Agreement is binding on Seller's and Broker's heirs, personal representatives, administrators, successors, and assigns. Broker may assign this Agreement to another listing office. This Agreement is the entire agreement between Seller and Broker. No prior or present agreements or representations will be binding on Seller or Broker unless included in this Agreement. Electronic signatures are acceptable and will be binding." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 367,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 365,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-bold mb-1", children: "15. Additional Terms:" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 377,
          columnNumber: 11
        }, this),
        renderField("additionalTerms", 600)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 376,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-2 text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: [
        /* @__PURE__ */ jsxDEV("p", { children: "Seller (____) (____) and Broker/Sales Associate (____) (____) acknowledge receipt of a copy of this page, which is Page 5 of 6." }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 383,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1", children: "ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 384,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 382,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-6", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-center text-[10px] text-muted-foreground mb-6", style: { fontFamily: "sans-serif" }, children: "Page 6 of 6" }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 389,
          columnNumber: 11
        }, this),
        signatureSection ? signatureSection : /* @__PURE__ */ jsxDEV("div", { className: "space-y-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/30 pb-1 mb-1", children: /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: "Seller's Signature" }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
                lineNumber: 399,
                columnNumber: 23
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
                lineNumber: 398,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "h-8" }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
                lineNumber: 401,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 397,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: "Date: _______________" }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 403,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Home Telephone: ",
              renderField("sellerPhone", 150)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 404,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Work Telephone: ",
              renderField("sellerWorkPhone", 150)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 405,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Address: ",
              renderField("sellerAddress", 200)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 406,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Email: ",
              renderField("sellerEmail", 200)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 407,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 396,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/30 pb-1 mb-1", children: /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: "Broker or Authorized Sales Associate" }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
                lineNumber: 412,
                columnNumber: 23
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
                lineNumber: 411,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "h-8" }, void 0, false, {
                fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
                lineNumber: 414,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 410,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: "Date: _______________" }, void 0, false, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 416,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Brokerage Firm: ",
              renderField("brokerCompany", 200)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 417,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Telephone: ",
              renderField("brokerPhone", 150)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 418,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs", children: [
              "Address: ",
              renderField("brokerAddress", 200)
            ] }, void 0, true, {
              fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
              lineNumber: 419,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
            lineNumber: 409,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 395,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
          lineNumber: 394,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 388,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-2 mt-6 text-[10px] text-muted-foreground", style: { fontFamily: "sans-serif" }, children: /* @__PURE__ */ jsxDEV("p", { children: "ERS-17nr Rev 3/2024 © 2024 Florida Association of Realtors®" }, void 0, false, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 428,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
        lineNumber: 427,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/deal/ListingAgreementDocument.tsx",
    lineNumber: 97,
    columnNumber: 5
  }, this);
}
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
const parseStoredSessionFieldValue = (value) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    if ("object" in parsed || "signedValue" in parsed || "tool" in parsed || "kind" in parsed) {
      return {
        schemaVersion: 1,
        kind: parsed.kind === "interactive" ? "interactive" : "markup",
        tool: typeof parsed.tool === "string" ? parsed.tool : "object",
        recipientId: typeof parsed.recipientId === "string" ? parsed.recipientId : null,
        object: parsed.object && typeof parsed.object === "object" ? parsed.object : null,
        signedValue: typeof parsed.signedValue === "string" ? parsed.signedValue : null
      };
    }
    return {
      schemaVersion: 1,
      kind: "markup",
      tool: typeof parsed.customType === "string" ? parsed.customType : typeof parsed.type === "string" ? parsed.type : "object",
      recipientId: typeof parsed.recipientId === "string" ? parsed.recipientId : null,
      object: parsed,
      signedValue: null
    };
  } catch {
    return null;
  }
};
const buildSignedSessionFieldValue = (existingValue, signedValue) => {
  const payload = parseStoredSessionFieldValue(existingValue);
  if (payload) {
    return JSON.stringify({
      ...payload,
      signedValue
    });
  }
  return JSON.stringify({
    schemaVersion: 1,
    kind: "interactive",
    tool: "signature",
    recipientId: null,
    object: null,
    signedValue
  });
};
function getFieldsForRole(role) {
  const isSeller = role == null ? void 0 : role.toLowerCase().includes("seller");
  return [
    { id: isSeller ? "seller-signature" : "broker-signature", type: "signature", label: "Sign Here", value: "", status: "empty" },
    { id: isSeller ? "seller-initials" : "broker-initials", type: "initials", label: "Initial", value: "", status: "empty" },
    { id: isSeller ? "seller-date" : "broker-date", type: "date", label: "Date Signed", value: "", status: "empty" }
  ];
}
function SessionSigningView({ token }) {
  var _a, _b, _c;
  const { data, isLoading, error } = useSessionByToken(token);
  const [pages, setPages] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [overlays, setOverlays] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFieldIndex, setModalFieldIndex] = useState(null);
  const [signMode, setSignMode] = useState("type");
  const [typedName, setTypedName] = useState("");
  const [savedSignature, setSavedSignature] = useState(null);
  const [savedInitials, setSavedInitials] = useState(null);
  const [finished, setFinished] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const RENDER_SCALE = 1.5;
  useEffect(() => {
    var _a2;
    if (!((_a2 = data == null ? void 0 : data.documents) == null ? void 0 : _a2.length)) return;
    const loadAll = async () => {
      setPdfLoading(true);
      const allPages = [];
      for (const doc of data.documents) {
        if (!doc.storage_path) continue;
        try {
          const { data: urlData } = supabase.storage.from("admin-documents").getPublicUrl(doc.storage_path);
          const pdf = await pdfjsLib.getDocument(urlData.publicUrl).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const vp = page.getViewport({ scale: RENDER_SCALE });
            const canvas = document.createElement("canvas");
            canvas.width = vp.width;
            canvas.height = vp.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            allPages.push({
              url: canvas.toDataURL(),
              renderScale: RENDER_SCALE,
              naturalW: vp.width,
              // px at renderScale
              naturalH: vp.height
            });
          }
        } catch (err) {
          console.error("Failed to load PDF:", err);
        }
      }
      setPages(allPages);
      setPdfLoading(false);
    };
    loadAll();
  }, [data == null ? void 0 : data.documents]);
  useEffect(() => {
    if (!(data == null ? void 0 : data.fields) || fields.length > 0 || overlays.length > 0) return;
    const rawFields = data.fields;
    if (rawFields.length === 0) {
      const defaults = [
        { id: "default-sig", type: "signature", label: "Sign Here", value: "", status: "active", page: 0, x: 0, y: 0, w: 0, h: 0 },
        { id: "default-date", type: "date", label: "Date Signed", value: "", status: "empty", page: 0, x: 0, y: 0, w: 0, h: 0 }
      ];
      setFields(defaults);
      return;
    }
    const mapped = [];
    const nextOverlays = [];
    rawFields.forEach((f, i) => {
      var _a2;
      const storedPayload = parseStoredSessionFieldValue(f.value);
      if ((_a2 = f.type) == null ? void 0 : _a2.startsWith("markup:")) {
        const overlayObject = storedPayload == null ? void 0 : storedPayload.object;
        if (!overlayObject) return;
        nextOverlays.push({
          id: f.id || `overlay-${i}`,
          page: typeof f.page === "number" ? f.page : 0,
          object: overlayObject
        });
        return;
      }
      const fieldRecipientId = (storedPayload == null ? void 0 : storedPayload.recipientId) || f.recipient_id;
      if (fieldRecipientId && fieldRecipientId !== data.recipient.id) {
        return;
      }
      const storedObject = storedPayload == null ? void 0 : storedPayload.object;
      const storedSignedValue = (storedPayload == null ? void 0 : storedPayload.signedValue) || (f.value && !f.value.trim().startsWith("{") ? f.value : "");
      const rawType = (storedPayload == null ? void 0 : storedPayload.tool) || f.type;
      const ftype = rawType === "signature" || rawType === "initials" || rawType === "date" ? rawType : "signature";
      const label = ftype === "signature" ? "Sign Here" : ftype === "initials" ? "Initial" : "Date Signed";
      mapped.push({
        id: f.id || `field-${i}`,
        type: ftype,
        label,
        value: storedSignedValue,
        status: storedSignedValue ? "completed" : "empty",
        page: typeof f.page === "number" ? f.page : 0,
        x: typeof (storedObject == null ? void 0 : storedObject.left) === "number" ? storedObject.left : typeof f.x === "number" ? f.x : 0,
        y: typeof (storedObject == null ? void 0 : storedObject.top) === "number" ? storedObject.top : typeof f.y === "number" ? f.y : 0,
        w: storedObject ? (storedObject.width || f.width || 160) * (storedObject.scaleX || 1) : typeof f.width === "number" ? f.width : 160,
        h: storedObject ? (storedObject.height || f.height || 40) * (storedObject.scaleY || 1) : typeof f.height === "number" ? f.height : 40
      });
    });
    const firstUnsigned = mapped.findIndex((f) => !f.value);
    if (firstUnsigned !== -1) {
      mapped[firstUnsigned].status = "active";
    }
    setFields(mapped);
    setOverlays(nextOverlays);
  }, [data == null ? void 0 : data.fields, fields.length, overlays.length]);
  const completedCount = fields.filter((f) => f.status === "completed").length;
  const allFieldsDone = fields.length > 0 && completedCount === fields.length;
  const advanceToNext = (currentIdx) => {
    const next = fields.findIndex((f, i) => i > currentIdx && f.status !== "completed");
    if (next !== -1) {
      setFields((prev) => prev.map((f, i) => i === next ? { ...f, status: "active" } : f));
    }
  };
  const handleFieldClick = (index) => {
    const field = fields[index];
    if (field.status === "completed") return;
    if (field.type === "date") {
      const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
      setFields((prev) => prev.map((f, i) => i === index ? { ...f, value: today, status: "completed" } : f));
      advanceToNext(index);
      return;
    }
    if (field.type === "signature" && savedSignature) {
      setFields((prev) => prev.map((f, i) => i === index ? { ...f, value: savedSignature, status: "completed" } : f));
      advanceToNext(index);
      return;
    }
    if (field.type === "initials" && savedInitials) {
      setFields((prev) => prev.map((f, i) => i === index ? { ...f, value: savedInitials, status: "completed" } : f));
      advanceToNext(index);
      return;
    }
    setModalFieldIndex(index);
    setModalOpen(true);
    setTypedName("");
    setSignMode("type");
  };
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);
  useEffect(() => {
    if (modalOpen && signMode === "draw") setTimeout(initCanvas, 100);
  }, [modalOpen, signMode, initCanvas]);
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };
  const startDraw = (e) => {
    var _a2;
    isDrawing.current = true;
    const ctx = (_a2 = canvasRef.current) == null ? void 0 : _a2.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const draw = (e) => {
    var _a2;
    if (!isDrawing.current) return;
    const ctx = (_a2 = canvasRef.current) == null ? void 0 : _a2.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  const stopDraw = () => {
    isDrawing.current = false;
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const handleAdoptSign = () => {
    if (modalFieldIndex === null) return;
    const field = fields[modalFieldIndex];
    let sigData = "";
    if (signMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      sigData = canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) {
        toast.error("Please type your name");
        return;
      }
      sigData = `typed:${typedName.trim()}`;
    }
    if (field.type === "signature") setSavedSignature(sigData);
    if (field.type === "initials") setSavedInitials(sigData);
    setFields((prev) => prev.map((f, i) => i === modalFieldIndex ? { ...f, value: sigData, status: "completed" } : f));
    setModalOpen(false);
    setModalFieldIndex(null);
    advanceToNext(modalFieldIndex);
  };
  const handleFinish = async () => {
    if (!(data == null ? void 0 : data.recipient)) return;
    const sigField = fields.find((f) => f.type === "signature");
    try {
      const fieldUpdates = fields.filter((f) => f.value && !f.id.startsWith("default-")).map((f) => {
        const existingField = data.fields.find((sf) => sf.id === f.id);
        return {
          id: f.id,
          value: buildSignedSessionFieldValue((existingField == null ? void 0 : existingField.value) || null, f.value)
        };
      });
      const { error: submitErr } = await supabase.functions.invoke("submit-signing-session", {
        body: {
          token,
          signatureData: (sigField == null ? void 0 : sigField.value) || "",
          fields: fieldUpdates
        }
      });
      if (submitErr) throw submitErr;
      setFinished(true);
      toast.success("Document signed successfully!");
    } catch {
      toast.error("Failed to sign document");
    }
  };
  const renderSigValue = (val, small = false) => {
    if (val.startsWith("typed:")) {
      return /* @__PURE__ */ jsxDEV("span", { className: small ? "text-lg" : "text-2xl", style: { fontFamily: "'Dancing Script', cursive" }, children: val.replace("typed:", "") }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 379,
        columnNumber: 14
      }, this);
    }
    return /* @__PURE__ */ jsxDEV("img", { src: val, alt: "Signature", className: small ? "h-8 max-w-full object-contain" : "h-12 max-w-full object-contain" }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 381,
      columnNumber: 12
    }, this);
  };
  if (isLoading || pdfLoading) {
    return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "Loading document..." }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 385,
      columnNumber: 87
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 385,
      columnNumber: 12
    }, this);
  }
  if (error) {
    return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center max-w-md mx-auto p-8", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-semibold mb-2", children: "Signing Data Unavailable" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 392,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "The signing link could not load its saved fields. Please return to the deal and send again." }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 393,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 391,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 390,
      columnNumber: 7
    }, this);
  }
  if (!data) {
    return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-semibold mb-2", children: "Document Not Found" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 402,
        columnNumber: 116
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "This signing link is invalid or has expired." }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 402,
        columnNumber: 182
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 402,
      columnNumber: 87
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 402,
      columnNumber: 12
    }, this);
  }
  if (finished || data.recipient.status === "signed") {
    return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center max-w-md mx-auto p-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-8 h-8" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 409,
        columnNumber: 125
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 409,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-semibold mb-2", children: "Document Signed!" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 410,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground mb-2", children: "You have successfully signed the document." }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 411,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "You may close this window." }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 412,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 408,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 407,
      columnNumber: 7
    }, this);
  }
  const positionedFields = fields.filter((f) => f.w > 0);
  const fallbackFields = fields.filter((f) => f.w === 0);
  const overlaysByPage = overlays.reduce((acc, overlay) => {
    if (!acc[overlay.page]) acc[overlay.page] = [];
    acc[overlay.page].push(overlay);
    return acc;
  }, {});
  const renderOverlay = (overlay) => {
    const object = overlay.object;
    const commonStyle = {
      position: "absolute",
      left: object.left || 0,
      top: object.top || 0,
      pointerEvents: "none",
      transform: object.angle ? `rotate(${object.angle}deg)` : void 0,
      transformOrigin: "top left"
    };
    if (object.type === "path" && Array.isArray(object.path)) {
      const d = object.path.map((segment) => {
        const [command, ...values] = segment;
        return `${command} ${values.join(" ")}`;
      }).join(" ");
      return /* @__PURE__ */ jsxDEV(
        "svg",
        {
          style: commonStyle,
          width: (object.width || 0) * (object.scaleX || 1),
          height: (object.height || 0) * (object.scaleY || 1),
          viewBox: `0 0 ${object.width || 1} ${object.height || 1}`,
          children: /* @__PURE__ */ jsxDEV(
            "path",
            {
              d,
              fill: "none",
              stroke: object.stroke || "#000000",
              strokeWidth: object.strokeWidth || 2,
              strokeLinecap: "round",
              strokeLinejoin: "round"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 454,
              columnNumber: 11
            },
            this
          )
        },
        overlay.id,
        false,
        {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 447,
          columnNumber: 9
        },
        this
      );
    }
    if (object.type === "line") {
      const x1 = object.x1 ?? 0;
      const y1 = object.y1 ?? 0;
      const x2 = object.x2 ?? 0;
      const y2 = object.y2 ?? 0;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const width = Math.max(Math.abs(x2 - x1), 1);
      const height = Math.max(Math.abs(y2 - y1), 1);
      return /* @__PURE__ */ jsxDEV(
        "svg",
        {
          style: { ...commonStyle, left: (object.left || 0) + minX, top: (object.top || 0) + minY },
          width,
          height,
          viewBox: `0 0 ${width} ${height}`,
          children: /* @__PURE__ */ jsxDEV(
            "line",
            {
              x1: x1 - minX,
              y1: y1 - minY,
              x2: x2 - minX,
              y2: y2 - minY,
              stroke: object.stroke || "#000000",
              strokeWidth: object.strokeWidth || 2,
              strokeLinecap: "round"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 484,
              columnNumber: 11
            },
            this
          )
        },
        overlay.id,
        false,
        {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 477,
          columnNumber: 9
        },
        this
      );
    }
    if (object.type === "ellipse") {
      const width = (object.rx || 0) * 2;
      const height = (object.ry || 0) * 2;
      return /* @__PURE__ */ jsxDEV(
        "div",
        {
          style: {
            ...commonStyle,
            width,
            height,
            border: `${object.strokeWidth || 2}px solid ${object.stroke || "#ef4444"}`,
            borderRadius: "9999px",
            background: object.fill && object.fill !== "transparent" ? object.fill : "transparent"
          }
        },
        overlay.id,
        false,
        {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 501,
          columnNumber: 9
        },
        this
      );
    }
    if (object.type === "rect") {
      return /* @__PURE__ */ jsxDEV(
        "div",
        {
          style: {
            ...commonStyle,
            width: (object.width || 0) * (object.scaleX || 1),
            height: (object.height || 0) * (object.scaleY || 1),
            background: object.fill || "transparent",
            border: object.stroke ? `${object.strokeWidth || 0}px solid ${object.stroke}` : void 0
          }
        },
        overlay.id,
        false,
        {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 517,
          columnNumber: 9
        },
        this
      );
    }
    if (object.type === "image" && object.src) {
      return /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: object.src,
          alt: "",
          style: {
            ...commonStyle,
            width: (object.width || 0) * (object.scaleX || 1),
            height: (object.height || 0) * (object.scaleY || 1),
            objectFit: "contain"
          }
        },
        overlay.id,
        false,
        {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 532,
          columnNumber: 9
        },
        this
      );
    }
    if ((object.type === "i-text" || object.type === "text" || object.type === "textbox") && object.text) {
      return /* @__PURE__ */ jsxDEV(
        "div",
        {
          style: {
            ...commonStyle,
            color: object.fill || "#000000",
            fontSize: object.fontSize || 14,
            fontFamily: object.fontFamily || "Arial",
            fontWeight: object.fontWeight || "normal",
            fontStyle: object.fontStyle || "normal",
            textDecoration: object.underline ? "underline" : void 0,
            whiteSpace: "pre-wrap"
          },
          children: object.text
        },
        overlay.id,
        false,
        {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 548,
          columnNumber: 9
        },
        this
      );
    }
    return null;
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "sticky top-0 z-50", style: { backgroundColor: "#4C00C2" }, children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-white", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-base font-semibold", children: data.session.session_name }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 574,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs opacity-80", children: "Please review and sign" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 575,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 573,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium", children: [
          "Signing as: ",
          data.recipient.first_name,
          " ",
          data.recipient.last_name
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 578,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mt-1", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs opacity-80", children: [
            completedCount,
            " of ",
            fields.length,
            " completed"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 580,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Progress, { value: completedCount / Math.max(fields.length, 1) * 100, className: "w-24 h-1.5 bg-white/30" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 581,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 579,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 577,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 572,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 571,
      columnNumber: 7
    }, this),
    data.session.email_message && /* @__PURE__ */ jsxDEV("div", { className: "max-w-5xl mx-auto px-6 py-2 bg-blue-50 border-b border-blue-100", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-blue-800", children: data.session.email_message }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 589,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 588,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "max-w-4xl mx-auto py-8 px-4", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
        pages.length === 0 && /* @__PURE__ */ jsxDEV("div", { className: "bg-white shadow-lg border rounded-sm p-16 text-center text-muted-foreground", children: "No document pages available." }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 597,
          columnNumber: 13
        }, this),
        pages.map((page, pageIdx) => {
          const pageFields = positionedFields.filter((f) => f.page === pageIdx);
          const pageOverlays = overlaysByPage[pageIdx] || [];
          return /* @__PURE__ */ jsxDEV("div", { className: "bg-white shadow-lg border rounded-sm relative", style: { width: page.naturalW, maxWidth: "100%" }, children: [
            /* @__PURE__ */ jsxDEV("img", { src: page.url, alt: `Page ${pageIdx + 1}`, style: { width: page.naturalW, maxWidth: "100%", display: "block" } }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 608,
              columnNumber: 17
            }, this),
            pageOverlays.map(renderOverlay),
            pageFields.map((field) => {
              const fieldIdx = fields.indexOf(field);
              const isCompleted = field.status === "completed";
              const isActive = field.status === "active";
              return /* @__PURE__ */ jsxDEV(
                "div",
                {
                  onClick: () => handleFieldClick(fieldIdx),
                  title: field.label,
                  style: {
                    position: "absolute",
                    left: field.x,
                    top: field.y,
                    width: field.w,
                    height: field.h,
                    cursor: isCompleted ? "default" : "pointer",
                    boxSizing: "border-box"
                  },
                  className: `transition-all duration-200 rounded flex items-center justify-center overflow-hidden
                        ${isCompleted ? "bg-green-50 border-2 border-green-400" : isActive ? "bg-amber-100/90 border-2 border-amber-500 shadow-lg ring-2 ring-amber-400 animate-pulse" : "bg-amber-50/80 border-2 border-dashed border-amber-400 hover:bg-amber-100/80"}`,
                  children: isCompleted ? /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 px-1 w-full justify-center", children: field.type === "date" ? /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-semibold text-green-700 truncate", children: field.value }, void 0, false, {
                    fileName: "/dev-server/src/pages/SignDocument.tsx",
                    lineNumber: 640,
                    columnNumber: 31
                  }, this) : renderSigValue(field.value, true) }, void 0, false, {
                    fileName: "/dev-server/src/pages/SignDocument.tsx",
                    lineNumber: 638,
                    columnNumber: 25
                  }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 px-1", children: [
                    field.type === "signature" && /* @__PURE__ */ jsxDEV(Pen, { className: "w-3 h-3 text-amber-600 shrink-0" }, void 0, false, {
                      fileName: "/dev-server/src/pages/SignDocument.tsx",
                      lineNumber: 646,
                      columnNumber: 58
                    }, this),
                    field.type === "initials" && /* @__PURE__ */ jsxDEV(Type, { className: "w-3 h-3 text-amber-600 shrink-0" }, void 0, false, {
                      fileName: "/dev-server/src/pages/SignDocument.tsx",
                      lineNumber: 647,
                      columnNumber: 57
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-semibold text-amber-700 truncate", children: field.label }, void 0, false, {
                      fileName: "/dev-server/src/pages/SignDocument.tsx",
                      lineNumber: 648,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/SignDocument.tsx",
                    lineNumber: 645,
                    columnNumber: 25
                  }, this)
                },
                field.id,
                false,
                {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 616,
                  columnNumber: 21
                },
                this
              );
            })
          ] }, pageIdx, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 607,
            columnNumber: 15
          }, this);
        })
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 595,
        columnNumber: 9
      }, this),
      fallbackFields.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "mt-8 bg-white shadow-lg border rounded-sm p-8", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold mb-4", children: "Complete Your Signature" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 662,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: fallbackFields.map((field) => {
          const fieldIdx = fields.indexOf(field);
          const isActive = field.status === "active";
          const isCompleted = field.status === "completed";
          return /* @__PURE__ */ jsxDEV(
            "div",
            {
              onClick: () => handleFieldClick(fieldIdx),
              className: `relative cursor-pointer transition-all duration-300 rounded-md border-2 px-4 py-3
                      ${isCompleted ? "bg-white border-green-400 cursor-default" : isActive ? "bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg" : "bg-amber-50 border-amber-300 border-dashed"}`,
              style: { minHeight: 56 },
              children: isCompleted ? /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
                field.type === "date" ? /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium", children: field.value }, void 0, false, {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 678,
                  columnNumber: 50
                }, this) : renderSigValue(field.value, true),
                /* @__PURE__ */ jsxDEV(Check, { className: "w-4 h-4 text-green-600 ml-auto flex-shrink-0" }, void 0, false, {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 679,
                  columnNumber: 25
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/SignDocument.tsx",
                lineNumber: 677,
                columnNumber: 23
              }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
                field.type === "signature" && /* @__PURE__ */ jsxDEV(Pen, { className: "w-4 h-4 text-amber-600" }, void 0, false, {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 683,
                  columnNumber: 56
                }, this),
                field.type === "initials" && /* @__PURE__ */ jsxDEV(Type, { className: "w-4 h-4 text-amber-600" }, void 0, false, {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 684,
                  columnNumber: 55
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-amber-700", children: field.label }, void 0, false, {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 685,
                  columnNumber: 25
                }, this),
                isActive && /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-4 h-4 text-amber-600 animate-bounce ml-auto" }, void 0, false, {
                  fileName: "/dev-server/src/pages/SignDocument.tsx",
                  lineNumber: 686,
                  columnNumber: 38
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/SignDocument.tsx",
                lineNumber: 682,
                columnNumber: 23
              }, this)
            },
            field.id,
            false,
            {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 669,
              columnNumber: 19
            },
            this
          );
        }) }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 663,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 661,
        columnNumber: 11
      }, this),
      allFieldsDone && /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsxDEV(Button, { onClick: handleFinish, className: "px-12 py-6 text-lg font-semibold rounded-lg shadow-xl", style: { backgroundColor: "#F5C518", color: "#1a1a2e" }, children: [
        /* @__PURE__ */ jsxDEV(Check, { className: "w-5 h-5 mr-2" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 699,
          columnNumber: 15
        }, this),
        " Finish Signing"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 698,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 697,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-center text-xs text-muted-foreground mt-6 max-w-lg mx-auto", children: 'By clicking "Finish Signing", you agree that your electronic signature is the legal equivalent of your manual signature on this document.' }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 704,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 593,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: modalOpen, onOpenChange: setModalOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "sm:max-w-lg", children: /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold", children: modalFieldIndex !== null && ((_a = fields[modalFieldIndex]) == null ? void 0 : _a.type) === "initials" ? "Add Your Initials" : "Adopt Your Signature" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 712,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: [
        "Create your ",
        modalFieldIndex !== null && ((_b = fields[modalFieldIndex]) == null ? void 0 : _b.type) === "initials" ? "initials" : "signature",
        " below."
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 715,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 border-b pb-2", children: [
        /* @__PURE__ */ jsxDEV("button", { onClick: () => setSignMode("type"), className: `px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === "type" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxDEV(Type, { className: "w-3.5 h-3.5 inline mr-1.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 720,
            columnNumber: 17
          }, this),
          " Type"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 719,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("button", { onClick: () => setSignMode("draw"), className: `px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === "draw" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxDEV(Pen, { className: "w-3.5 h-3.5 inline mr-1.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 723,
            columnNumber: 17
          }, this),
          " Draw"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 722,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 718,
        columnNumber: 13
      }, this),
      signMode === "type" ? /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("input", { value: typedName, onChange: (e) => setTypedName(e.target.value), placeholder: modalFieldIndex !== null && ((_c = fields[modalFieldIndex]) == null ? void 0 : _c.type) === "initials" ? "Your initials" : "Your full name", className: "w-full border rounded-md px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-primary", style: { fontFamily: "'Dancing Script', cursive" }, autoFocus: true }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 728,
          columnNumber: 17
        }, this),
        typedName && /* @__PURE__ */ jsxDEV("div", { className: "mt-3 p-4 bg-muted/30 border rounded-md text-center", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mb-1", children: "Preview" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 731,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-3xl", style: { fontFamily: "'Dancing Script', cursive" }, children: typedName }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 732,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 730,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 727,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("canvas", { ref: canvasRef, width: 460, height: 140, className: "border rounded-md cursor-crosshair w-full bg-white", style: { touchAction: "none" }, onMouseDown: startDraw, onMouseMove: draw, onMouseUp: stopDraw, onMouseLeave: stopDraw, onTouchStart: startDraw, onTouchMove: draw, onTouchEnd: stopDraw }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 738,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: clearCanvas, className: "mt-1 text-xs", children: "Clear" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 739,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 737,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { onClick: handleAdoptSign, className: "w-full", style: { backgroundColor: "#F5C518", color: "#1a1a2e" }, children: "Adopt and Sign" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 742,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 711,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 710,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 709,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("link", { href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap", rel: "stylesheet" }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 747,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/SignDocument.tsx",
    lineNumber: 570,
    columnNumber: 5
  }, this);
}
function SignDocument() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const recipientToken = searchParams.get("recipient");
  const { data: request, isLoading: legacyLoading } = useSignatureRequestByToken(token);
  const { data: sessionData, isLoading: sessionLoading } = useSessionByToken(
    // Only try session lookup if no legacy request found yet and no recipient param
    !request && !recipientToken ? token : void 0
  );
  const signMutation = useSignDocument();
  const [fields, setFields] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFieldIndex, setModalFieldIndex] = useState(null);
  const [signMode, setSignMode] = useState("type");
  const [typedName, setTypedName] = useState("");
  const [savedSignature, setSavedSignature] = useState(null);
  const [savedInitials, setSavedInitials] = useState(null);
  const [finished, setFinished] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const fieldRefs = useRef({});
  const currentRecipient = (_a = request == null ? void 0 : request.signature_recipients) == null ? void 0 : _a.find(
    (r) => recipientToken ? r.recipient_token === recipientToken : r.status === "pending"
  );
  const allSigned = (_b = request == null ? void 0 : request.signature_recipients) == null ? void 0 : _b.every((r) => r.status === "signed");
  useEffect(() => {
    if (currentRecipient && fields.length === 0) {
      const f = getFieldsForRole(currentRecipient.role);
      f[0].status = "active";
      setFields(f);
      setActiveIndex(0);
    }
  }, [currentRecipient, fields.length]);
  useEffect(() => {
    if (fields.length === 0) return;
    const active = fields[activeIndex];
    if (!active || active.status === "completed") return;
    const el = fieldRefs.current[active.id];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [activeIndex, fields]);
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);
  useEffect(() => {
    if (modalOpen && signMode === "draw") setTimeout(initCanvas, 100);
  }, [modalOpen, signMode, initCanvas]);
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };
  const startDraw = (e) => {
    var _a2;
    isDrawing.current = true;
    const ctx = (_a2 = canvasRef.current) == null ? void 0 : _a2.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const draw = (e) => {
    var _a2;
    if (!isDrawing.current) return;
    const ctx = (_a2 = canvasRef.current) == null ? void 0 : _a2.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  const stopDraw = () => {
    isDrawing.current = false;
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const completedCount = fields.filter((f) => f.status === "completed").length;
  const allFieldsDone = fields.length > 0 && completedCount === fields.length;
  const advanceToNext = (currentIdx) => {
    const next = fields.findIndex((f, i) => i > currentIdx && f.status !== "completed");
    if (next !== -1) {
      setFields((prev) => prev.map((f, i) => i === next ? { ...f, status: "active" } : f));
      setActiveIndex(next);
    }
  };
  const handleFieldClick = (index) => {
    const field = fields[index];
    if (field.status === "completed") return;
    if (field.type === "date") {
      const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
      setFields((prev) => prev.map((f, i) => i === index ? { ...f, value: today, status: "completed" } : f));
      advanceToNext(index);
      return;
    }
    if (field.type === "signature" && savedSignature) {
      setFields((prev) => prev.map((f, i) => i === index ? { ...f, value: savedSignature, status: "completed" } : f));
      advanceToNext(index);
      return;
    }
    if (field.type === "initials" && savedInitials) {
      setFields((prev) => prev.map((f, i) => i === index ? { ...f, value: savedInitials, status: "completed" } : f));
      advanceToNext(index);
      return;
    }
    setModalFieldIndex(index);
    setModalOpen(true);
    setTypedName("");
    setSignMode("type");
  };
  const handleAdoptSign = () => {
    if (modalFieldIndex === null) return;
    const field = fields[modalFieldIndex];
    let sigData = "";
    if (signMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      sigData = canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) {
        toast.error("Please type your name");
        return;
      }
      sigData = `typed:${typedName.trim()}`;
    }
    if (field.type === "signature") setSavedSignature(sigData);
    if (field.type === "initials") setSavedInitials(sigData);
    setFields((prev) => prev.map((f, i) => i === modalFieldIndex ? { ...f, value: sigData, status: "completed" } : f));
    setModalOpen(false);
    setModalFieldIndex(null);
    advanceToNext(modalFieldIndex);
  };
  const handleFinish = async () => {
    if (!currentRecipient) return;
    const sigField2 = fields.find((f) => f.type === "signature");
    try {
      await signMutation.mutateAsync({ recipientId: currentRecipient.id, signatureData: (sigField2 == null ? void 0 : sigField2.value) || "" });
      setFinished(true);
      toast.success("Document signed successfully!");
    } catch {
      toast.error("Failed to sign document");
    }
  };
  const renderSigValue = (val, small = false) => {
    if (val.startsWith("typed:")) {
      return /* @__PURE__ */ jsxDEV("span", { className: small ? "text-lg" : "text-2xl", style: { fontFamily: "'Dancing Script', cursive" }, children: val.replace("typed:", "") }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 927,
        columnNumber: 14
      }, this);
    }
    return /* @__PURE__ */ jsxDEV("img", { src: val, alt: "Signature", className: small ? "h-8" : "h-12" }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 929,
      columnNumber: 12
    }, this);
  };
  if (legacyLoading || sessionLoading) {
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(SeoHead, { title: "Sign Document | United Estates Realty", description: "Review and electronically sign your real estate document securely with United Estates Realty.", path: `/sign/${token || ""}` }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 934,
        columnNumber: 14
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "Loading document..." }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 934,
        columnNumber: 284
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 934,
        columnNumber: 209
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 934,
      columnNumber: 12
    }, this);
  }
  if (sessionData && !request) {
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(SeoHead, { title: "Sign Document | United Estates Realty", description: "Review and electronically sign your real estate document securely with United Estates Realty.", path: `/sign/${token || ""}` }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 939,
        columnNumber: 14
      }, this),
      /* @__PURE__ */ jsxDEV(SessionSigningView, { token }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 939,
        columnNumber: 209
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 939,
      columnNumber: 12
    }, this);
  }
  if (!request) {
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(SeoHead, { title: "Sign Document | United Estates Realty", description: "Review and electronically sign your real estate document securely with United Estates Realty.", path: `/sign/${token || ""}` }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 944,
        columnNumber: 14
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-semibold mb-2", children: "Document Not Found" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 944,
          columnNumber: 313
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground", children: "This signing link is invalid or has expired." }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 944,
          columnNumber: 379
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 944,
        columnNumber: 284
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 944,
        columnNumber: 209
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 944,
      columnNumber: 12
    }, this);
  }
  const alreadySigned = (currentRecipient == null ? void 0 : currentRecipient.status) === "signed";
  if (finished || alreadySigned) {
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(SeoHead, { title: "Document Signed | United Estates Realty", description: "Your real estate document has been successfully signed through United Estates Realty.", path: `/sign/${token || ""}` }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 951,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center max-w-md mx-auto p-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-8 h-8" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 954,
          columnNumber: 127
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 954,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-semibold mb-2", children: "Document Signed!" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 955,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground mb-2", children: [
          alreadySigned && !finished ? "You have already signed " : "You have successfully signed ",
          /* @__PURE__ */ jsxDEV("strong", { children: request.document_name }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 958,
            columnNumber: 15
          }, this),
          "."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 956,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "You may close this window." }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 960,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 953,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 952,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 950,
      columnNumber: 7
    }, this);
  }
  if (allSigned) {
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(SeoHead, { title: "All Signatures Complete | United Estates Realty", description: "All signatures have been collected for this real estate document through United Estates Realty.", path: `/sign/${token || ""}` }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 970,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center max-w-md mx-auto p-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-8 h-8" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 973,
          columnNumber: 127
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 973,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-semibold mb-2", children: "All Signatures Complete" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 974,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-muted-foreground mb-2", children: [
          /* @__PURE__ */ jsxDEV("strong", { children: request.document_name }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 975,
            columnNumber: 55
          }, this),
          " has been fully signed."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 975,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "You may close this window." }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 976,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 972,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 971,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 969,
      columnNumber: 7
    }, this);
  }
  const formData = request.form_data || {};
  const docFields = { ...DEFAULT_FIELDS, ...formData };
  const isSeller = (_c = currentRecipient == null ? void 0 : currentRecipient.role) == null ? void 0 : _c.toLowerCase().includes("seller");
  const sigField = fields.find((f) => f.type === "signature");
  const initialField = fields.find((f) => f.type === "initials");
  const dateField = fields.find((f) => f.type === "date");
  const sigIdx = fields.findIndex((f) => f.type === "signature");
  const initialIdx = fields.findIndex((f) => f.type === "initials");
  const dateIdx = fields.findIndex((f) => f.type === "date");
  const FieldOverlay = ({ field, index }) => {
    const isActive = field.status === "active";
    const isCompleted = field.status === "completed";
    return /* @__PURE__ */ jsxDEV(
      "div",
      {
        ref: (el) => {
          fieldRefs.current[field.id] = el;
        },
        onClick: () => handleFieldClick(index),
        className: `relative cursor-pointer transition-all duration-300 rounded-md border-2 px-4 py-3 my-1
          ${isCompleted ? "bg-white border-green-400 cursor-default" : isActive ? "bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg" : "bg-amber-50 border-amber-300 border-dashed"}`,
        style: { minHeight: 56 },
        children: isCompleted ? /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
          field.type === "date" ? /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium", children: field.value }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1007,
            columnNumber: 38
          }, this) : renderSigValue(field.value, true),
          /* @__PURE__ */ jsxDEV(Check, { className: "w-4 h-4 text-green-600 ml-auto flex-shrink-0" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1008,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1006,
          columnNumber: 11
        }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
          field.type === "signature" && /* @__PURE__ */ jsxDEV(Pen, { className: "w-4 h-4 text-amber-600" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1012,
            columnNumber: 44
          }, this),
          field.type === "initials" && /* @__PURE__ */ jsxDEV(Type, { className: "w-4 h-4 text-amber-600" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1013,
            columnNumber: 43
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-amber-700", children: field.label }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1014,
            columnNumber: 13
          }, this),
          isActive && /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-4 h-4 text-amber-600 animate-bounce ml-auto" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1015,
            columnNumber: 26
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1011,
          columnNumber: 11
        }, this)
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 998,
        columnNumber: 7
      },
      this
    );
  };
  const renderField = (key) => /* @__PURE__ */ jsxDEV("span", { className: "border-b-2 border-foreground/30 px-1", children: docFields[key] || "___" }, void 0, false, {
    fileName: "/dev-server/src/pages/SignDocument.tsx",
    lineNumber: 1023,
    columnNumber: 5
  }, this);
  const signatureSection = /* @__PURE__ */ jsxDEV("div", { className: "space-y-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-8", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider", style: { fontFamily: "sans-serif" }, children: "Seller" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1030,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mb-0.5", style: { fontFamily: "sans-serif" }, children: "Signature" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1033,
            columnNumber: 15
          }, this),
          isSeller && sigField ? /* @__PURE__ */ jsxDEV(FieldOverlay, { field: sigField, index: sigIdx }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1034,
            columnNumber: 39
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/20 h-10 flex items-end", children: (_d = request.signature_recipients) == null ? void 0 : _d.filter((r) => {
            var _a2;
            return ((_a2 = r.role) == null ? void 0 : _a2.toLowerCase().includes("seller")) && r.signature_data;
          }).map((r) => {
            var _a2;
            return /* @__PURE__ */ jsxDEV("div", { children: ((_a2 = r.signature_data) == null ? void 0 : _a2.startsWith("typed:")) ? /* @__PURE__ */ jsxDEV("span", { className: "text-xl", style: { fontFamily: "'Dancing Script', cursive" }, children: r.signature_data.replace("typed:", "") }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1037,
              columnNumber: 79
            }, this) : /* @__PURE__ */ jsxDEV("img", { src: r.signature_data, alt: "Sig", className: "h-10" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1037,
              columnNumber: 207
            }, this) }, r.id, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1037,
              columnNumber: 21
            }, this);
          }) }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1035,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1032,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mb-0.5", style: { fontFamily: "sans-serif" }, children: "Initials" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1043,
            columnNumber: 15
          }, this),
          isSeller && initialField ? /* @__PURE__ */ jsxDEV(FieldOverlay, { field: initialField, index: initialIdx }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1044,
            columnNumber: 43
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/20 h-8" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1044,
            columnNumber: 102
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1042,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mb-0.5", style: { fontFamily: "sans-serif" }, children: "Date Signed" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1047,
            columnNumber: 15
          }, this),
          isSeller && dateField ? /* @__PURE__ */ jsxDEV(FieldOverlay, { field: dateField, index: dateIdx }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1048,
            columnNumber: 40
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/20 h-8" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1048,
            columnNumber: 93
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1046,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-2 space-y-1", children: [
          /* @__PURE__ */ jsxDEV("p", { children: [
            "Home Telephone: ",
            /* @__PURE__ */ jsxDEV("span", { className: "border-b border-foreground/20 px-1", children: docFields.sellerPhone || "___" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1051,
              columnNumber: 34
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1051,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "Email: ",
            /* @__PURE__ */ jsxDEV("span", { className: "border-b border-foreground/20 px-1", children: docFields.sellerEmail || "___" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1052,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1052,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1050,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1031,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 1029,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider", style: { fontFamily: "sans-serif" }, children: "Broker / Agent" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1057,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mb-0.5", style: { fontFamily: "sans-serif" }, children: "Signature" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1060,
            columnNumber: 15
          }, this),
          !isSeller && sigField ? /* @__PURE__ */ jsxDEV(FieldOverlay, { field: sigField, index: sigIdx }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1061,
            columnNumber: 40
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/20 h-10 flex items-end", children: (_e = request.signature_recipients) == null ? void 0 : _e.filter((r) => {
            var _a2, _b2;
            return (((_a2 = r.role) == null ? void 0 : _a2.toLowerCase().includes("broker")) || ((_b2 = r.role) == null ? void 0 : _b2.toLowerCase().includes("agent"))) && r.signature_data;
          }).map((r) => {
            var _a2;
            return /* @__PURE__ */ jsxDEV("div", { children: ((_a2 = r.signature_data) == null ? void 0 : _a2.startsWith("typed:")) ? /* @__PURE__ */ jsxDEV("span", { className: "text-xl", style: { fontFamily: "'Dancing Script', cursive" }, children: r.signature_data.replace("typed:", "") }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1064,
              columnNumber: 79
            }, this) : /* @__PURE__ */ jsxDEV("img", { src: r.signature_data, alt: "Sig", className: "h-10" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1064,
              columnNumber: 207
            }, this) }, r.id, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1064,
              columnNumber: 21
            }, this);
          }) }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1062,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1059,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mb-0.5", style: { fontFamily: "sans-serif" }, children: "Initials" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1070,
            columnNumber: 15
          }, this),
          !isSeller && initialField ? /* @__PURE__ */ jsxDEV(FieldOverlay, { field: initialField, index: initialIdx }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1071,
            columnNumber: 44
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/20 h-8" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1071,
            columnNumber: 103
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1069,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-muted-foreground mb-0.5", style: { fontFamily: "sans-serif" }, children: "Date Signed" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1074,
            columnNumber: 15
          }, this),
          !isSeller && dateField ? /* @__PURE__ */ jsxDEV(FieldOverlay, { field: dateField, index: dateIdx }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1075,
            columnNumber: 41
          }, this) : /* @__PURE__ */ jsxDEV("div", { className: "border-b border-foreground/20 h-8" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1075,
            columnNumber: 94
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1073,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs mt-2 space-y-1", children: [
          /* @__PURE__ */ jsxDEV("p", { children: [
            "Brokerage: ",
            /* @__PURE__ */ jsxDEV("span", { className: "border-b border-foreground/20 px-1", children: docFields.brokerCompany || "___" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1078,
              columnNumber: 29
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1078,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "Telephone: ",
            /* @__PURE__ */ jsxDEV("span", { className: "border-b border-foreground/20 px-1", children: docFields.brokerPhone || "___" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1079,
              columnNumber: 29
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1079,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1077,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1058,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 1056,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/SignDocument.tsx",
    lineNumber: 1028,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/SignDocument.tsx",
    lineNumber: 1027,
    columnNumber: 5
  }, this);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(SeoHead, { title: "Sign Document | United Estates Realty", description: "Review and electronically sign your real estate document securely with United Estates Realty.", path: `/sign/${token || ""}` }, void 0, false, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 1089,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-100", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "sticky top-0 z-50", style: { backgroundColor: "#4C00C2" }, children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-white", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-base font-semibold", children: request.document_name }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1094,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs opacity-80", children: [
            "From: ",
            request.sender_name
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1095,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1093,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-right", children: [
          currentRecipient && /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium", children: [
            "Signing as: ",
            currentRecipient.name
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1098,
            columnNumber: 36
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-xs opacity-80", children: [
              completedCount,
              " of ",
              fields.length,
              " completed"
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1100,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Progress, { value: completedCount / Math.max(fields.length, 1) * 100, className: "w-24 h-1.5 bg-white/30" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1101,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1099,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1097,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1092,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1091,
        columnNumber: 9
      }, this),
      request.message && /* @__PURE__ */ jsxDEV("div", { className: "max-w-5xl mx-auto px-6 py-2 bg-blue-50 border-b border-blue-100", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-blue-800", children: request.message }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1109,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1108,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "max-w-4xl mx-auto py-8 px-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "bg-white shadow-lg border rounded-sm px-16 py-14", children: /* @__PURE__ */ jsxDEV(
          ListingAgreementDocument,
          {
            fields: docFields,
            renderField,
            signatureSection
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1115,
            columnNumber: 13
          },
          this
        ) }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1114,
          columnNumber: 11
        }, this),
        allFieldsDone && /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsxDEV(Button, { onClick: handleFinish, disabled: signMutation.isPending, className: "px-12 py-6 text-lg font-semibold rounded-lg shadow-xl", style: { backgroundColor: "#F5C518", color: "#1a1a2e" }, children: [
          /* @__PURE__ */ jsxDEV(Check, { className: "w-5 h-5 mr-2" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1125,
            columnNumber: 17
          }, this),
          signMutation.isPending ? "Completing..." : "Finish Signing"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1124,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1123,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-center text-xs text-muted-foreground mt-6 max-w-lg mx-auto", children: 'By clicking "Finish Signing", you agree that your electronic signature is the legal equivalent of your manual signature on this document.' }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1131,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1113,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Dialog, { open: modalOpen, onOpenChange: setModalOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "sm:max-w-lg", children: /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold", children: modalFieldIndex !== null && ((_f = fields[modalFieldIndex]) == null ? void 0 : _f.type) === "initials" ? "Add Your Initials" : "Adopt Your Signature" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1139,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: [
          "Create your ",
          modalFieldIndex !== null && ((_g = fields[modalFieldIndex]) == null ? void 0 : _g.type) === "initials" ? "initials" : "signature",
          " below."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1142,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 border-b pb-2", children: [
          /* @__PURE__ */ jsxDEV("button", { onClick: () => setSignMode("type"), className: `px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === "type" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsxDEV(Type, { className: "w-3.5 h-3.5 inline mr-1.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1147,
              columnNumber: 19
            }, this),
            " Type"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1146,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("button", { onClick: () => setSignMode("draw"), className: `px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${signMode === "draw" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsxDEV(Pen, { className: "w-3.5 h-3.5 inline mr-1.5" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1150,
              columnNumber: 19
            }, this),
            " Draw"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1149,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1145,
          columnNumber: 15
        }, this),
        signMode === "type" ? /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("input", { value: typedName, onChange: (e) => setTypedName(e.target.value), placeholder: modalFieldIndex !== null && ((_h = fields[modalFieldIndex]) == null ? void 0 : _h.type) === "initials" ? "Your initials" : "Your full name", className: "w-full border rounded-md px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-primary", style: { fontFamily: "'Dancing Script', cursive" }, autoFocus: true }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1155,
            columnNumber: 19
          }, this),
          typedName && /* @__PURE__ */ jsxDEV("div", { className: "mt-3 p-4 bg-muted/30 border rounded-md text-center", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mb-1", children: "Preview" }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1158,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-3xl", style: { fontFamily: "'Dancing Script', cursive" }, children: typedName }, void 0, false, {
              fileName: "/dev-server/src/pages/SignDocument.tsx",
              lineNumber: 1159,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1157,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1154,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("canvas", { ref: canvasRef, width: 460, height: 140, className: "border rounded-md cursor-crosshair w-full bg-white", style: { touchAction: "none" }, onMouseDown: startDraw, onMouseMove: draw, onMouseUp: stopDraw, onMouseLeave: stopDraw, onTouchStart: startDraw, onTouchMove: draw, onTouchEnd: stopDraw }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1165,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: clearCanvas, className: "mt-1 text-xs", children: "Clear" }, void 0, false, {
            fileName: "/dev-server/src/pages/SignDocument.tsx",
            lineNumber: 1166,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1164,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { onClick: handleAdoptSign, className: "w-full", style: { backgroundColor: "#F5C518", color: "#1a1a2e" }, children: "Adopt and Sign" }, void 0, false, {
          fileName: "/dev-server/src/pages/SignDocument.tsx",
          lineNumber: 1169,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1138,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1137,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1136,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("link", { href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap", rel: "stylesheet" }, void 0, false, {
        fileName: "/dev-server/src/pages/SignDocument.tsx",
        lineNumber: 1174,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/SignDocument.tsx",
      lineNumber: 1090,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/SignDocument.tsx",
    lineNumber: 1088,
    columnNumber: 5
  }, this);
}
export {
  SignDocument as default
};
