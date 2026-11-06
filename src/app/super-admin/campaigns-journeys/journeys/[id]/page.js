"use client";

import { useParams } from "next/navigation";
import JourneyBuilder from "../components/journey-builder";

// Edit a lifecycle journey (live builder)
export default function EditJourneyPage() {
  const { id } = useParams();
  return <JourneyBuilder journeyId={Array.isArray(id) ? id[0] : id} />;
}
