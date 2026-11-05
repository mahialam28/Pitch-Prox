"use client";

import React, { useEffect, useState } from "react";
import CurrentPlan from "./current-plan";
import Usage from "./usage-section";
import Charges from "./charges-section";
import Billing from "./billing-section";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const BillingSettingsPage = () => {
  const [billing, setBilling] = useState(null);

  useEffect(() => {
    apiRequest("/api/v1/billing")
      .then(setBilling)
      .catch((error) => showError("Billing not loaded", error.message));
  }, []);

  const subscription = billing?.subscription;
  return (
    <div className="space-y-6">
      <CurrentPlan subscription={subscription} />
      <Usage subscription={subscription} />
      <Charges subscription={subscription} />
      <Billing />
    </div>
  );
};

export default BillingSettingsPage;
