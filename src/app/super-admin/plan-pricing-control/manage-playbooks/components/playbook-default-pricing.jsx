"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

export const PlaybookDefaultPricing = () => {
  const [defaultPrice, setDefaultPrice] = useState("49.00");

  const handleBlur = () => {
    toast.success(`Default playbook price set to $${defaultPrice}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-dark-black/85 font-secondary tracking-tight">
          Playbook Pricing
        </h2>
        <p className="text-xs sm:text-sm text-medium-black mt-0.5">
          Set the default price for playbooks in the marketplace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">
        <label className="text-xs font-semibold text-dark-black/80 shrink-0">
          Default Playbook Price (USD)
        </label>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center w-36">
            <span className="absolute left-3 text-xs font-bold text-medium-black">
              $
            </span>
            <input
              type="text"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              onBlur={handleBlur}
              className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
            />
          </div>

          <span className="text-xs text-light-black font-medium">
            This is the suggested price for new playbooks.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaybookDefaultPricing;
