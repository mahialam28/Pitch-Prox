"use client";

import React, { useEffect, useState } from "react";
import CustomerInformation from "./components/customer-information";
import BillingCycle from "./components/billing-cycle";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const EMPTY = { firstName: "", company: "", email: "", phone: "", country: "United States" };

// User Portal: a sales rep creates a customer account on a plan. The account is
// owned by the rep; the customer activates it with the link shown after "Send Link".
export default function UserPortalPage() {
  const [formData, setFormData] = useState(EMPTY);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/plans")
      .then((data) => !cancelled && setPlans(data.results.filter((plan) => !plan.isTrial)))
      .catch((error) => showError("Plans not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFormChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const createAccount = async () => {
    try {
      return await apiRequest("/api/v1/customers", {
        method: "POST",
        body: { fullName: formData.firstName, company: formData.company, email: formData.email, phone: formData.phone, country: formData.country, planId: selectedPlan, billingCycle, seats },
      });
    } catch (error) {
      showError("Account not created", error.message);
      return null;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <CustomerInformation
            formData={formData}
            onFormChange={handleFormChange}
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
            billingCycle={billingCycle}
            plans={plans}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <BillingCycle
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            selectedPlan={selectedPlan}
            seats={seats}
            onSeatsChange={setSeats}
            customerEmail={formData.email}
            plans={plans}
            onSendLink={createAccount}
            onAddAnother={() => {
              setFormData(EMPTY);
              setSelectedPlan("pro");
              setBillingCycle("monthly");
              setSeats(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
