"use client";

import React, { useState } from "react";
import PricingKpiCards from "./components/pricing-kpi-cards";
import SubscriptionPlans, { initialPlansData } from "./components/subscription-plans";
import ReportAddOns from "./components/report-add-ons";
import PlaybookAddOns from "./components/playbook-add-ons";
import BillingRules from "./components/billing-rules";
import PromotionalCodes, { initialPromoCodesData } from "./components/promotional-codes";
import EditPlanModal from "./components/edit-plan-modal";
import TrialRulesModal from "./components/trial-rules-modal";
import EnterpriseConfigModal from "./components/enterprise-config-modal";
import AddPromoCodeModal from "./components/add-promo-code-modal";
import EditReportAddOnsModal from "./components/edit-report-add-ons-modal";
import { AddNewPlanModal, DeletePromoCodeModal } from "./components/plan-pricing-dialogs";

export default function PlanPricingControlPage() {
  const [plans, setPlans] = useState(initialPlansData);
  const [promoCodes, setPromoCodes] = useState(initialPromoCodesData);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);
  const [isTrialRulesModalOpen, setIsTrialRulesModalOpen] = useState(false);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [selectedPromoCodeForEdit, setSelectedPromoCodeForEdit] = useState(null);
  const [isReportAddOnsModalOpen, setIsReportAddOnsModalOpen] = useState(false);
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [deletingPromo, setDeletingPromo] = useState(null);

  // Plan handlers
  const handleAddNewPlan = () => setIsNewPlanOpen(true);

  const handleEditPlan = (plan) => {
    setSelectedPlanForEdit(plan);
    setIsAddEditModalOpen(true);
  };

  const handleManageTrialRules = () => {
    setIsTrialRulesModalOpen(true);
  };

  const handleConfigureEnterprise = () => {
    setIsEnterpriseModalOpen(true);
  };

  const handleSavePlan = (savedPlan) => {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === savedPlan.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPlan.id ? savedPlan : p));
      }
      return [...prev, savedPlan];
    });
  };

  // Promo Code Handlers
  const handleAddNewPromoCode = () => {
    setSelectedPromoCodeForEdit(null);
    setIsPromoCodeModalOpen(true);
  };

  const handleEditPromoCode = (codeItem) => {
    setSelectedPromoCodeForEdit(codeItem);
    setIsPromoCodeModalOpen(true);
  };

  // Asks first (Delete Promo Code dialog), then removes the code locally
  const handleDeletePromoCode = (id) => setDeletingPromo(promoCodes.find((item) => item.id === id) ?? null);

  const handleSavePromoCode = (savedCode) => {
    setPromoCodes((prev) => {
      const exists = prev.some((c) => c.id === savedCode.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCode.id ? savedCode : c));
      }
      return [savedCode, ...prev];
    });
  };

  const scrollToPromoCodes = () => {
    const promoSection = document.getElementById("promotional-codes-section");
    if (promoSection) {
      promoSection.scrollIntoView({ behavior: "smooth" });
    } else {
      handleAddNewPromoCode();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-12 max-w-full overflow-hidden">
      {/* 1. Header KPI Cards Grid */}
      <PricingKpiCards onOpenPromoCodes={scrollToPromoCodes} />

      {/* 2. Subscription Plans Section */}
      <SubscriptionPlans
        plans={plans}
        onAddNewPlan={handleAddNewPlan}
        onEditPlan={handleEditPlan}
        onManageTrialRules={handleManageTrialRules}
        onConfigureEnterprise={handleConfigureEnterprise}
      />

      {/* 3. 3-Column Add-Ons & Billing Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        <ReportAddOns onEditPlan={() => setIsReportAddOnsModalOpen(true)} />
        <PlaybookAddOns />
        <BillingRules />
      </div>

      {/* 4. Promotional Codes Table Section */}
      <div id="promotional-codes-section" className="w-full">
        <PromotionalCodes
          promoCodes={promoCodes}
          onAddNewCode={handleAddNewPromoCode}
          onEditCode={handleEditPromoCode}
          onDeleteCode={handleDeletePromoCode}
        />
      </div>

      {/* ── Interactive Modals ── */}
      <AddNewPlanModal isOpen={isNewPlanOpen} onClose={() => setIsNewPlanOpen(false)} onCreate={(plan) => setPlans((prev) => [...prev, plan])} />
      <DeletePromoCodeModal
        promo={deletingPromo}
        onClose={() => setDeletingPromo(null)}
        onConfirm={(promo) => setPromoCodes((prev) => prev.filter((item) => item.id !== promo.id))}
      />

      {/* Edit Plan Modal (Matching Image from previous prompt) */}
      <EditPlanModal
        isOpen={isAddEditModalOpen}
        plan={selectedPlanForEdit}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSavePlan}
        onDelete={(planId) => setPlans((prev) => prev.filter((p) => p.id !== planId))}
      />

      {/* Manage Trial Rules Modal (Matching Image 1) */}
      <TrialRulesModal
        isOpen={isTrialRulesModalOpen}
        onClose={() => setIsTrialRulesModalOpen(false)}
      />

      {/* Edit Report Add-Ons Modal (Matching Image 2) */}
      <EditReportAddOnsModal
        isOpen={isReportAddOnsModalOpen}
        onClose={() => setIsReportAddOnsModalOpen(false)}
      />

      {/* Add / Edit Promo Code Modal (Matching Image 3) */}
      <AddPromoCodeModal
        isOpen={isPromoCodeModalOpen}
        promoCode={selectedPromoCodeForEdit}
        onClose={() => setIsPromoCodeModalOpen(false)}
        onSave={handleSavePromoCode}
      />

      {/* Configure Enterprise Modal (Matching Image 4) */}
      <EnterpriseConfigModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
      />
    </div>
  );
}
