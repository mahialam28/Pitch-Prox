"use client";

import React, { createContext, useContext, useState } from "react";

const EmailContext = createContext({
  email: "",
  setEmail: () => {},
});

export const useEmail = () => useContext(EmailContext);

export const EmailProvider = ({ children }) => {
  const [email, setEmail] = useState("");

  return (
    <EmailContext.Provider value={{ email, setEmail }}>
      {children}
    </EmailContext.Provider>
  );
};

export default EmailProvider;
