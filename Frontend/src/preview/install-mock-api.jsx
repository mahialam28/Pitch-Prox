"use client";

import { installMockApi } from "./mock-api";

// Runs when this module loads (before any screen asks for data), so every /api/ call
// is answered by the in-browser sample data instead of a server.
installMockApi();

export default function InstallMockApi() {
  return null;
}
