import CallsHeader from "./components/calls-header";
import CallHistory from "./components/call-history";

export default function CallsPage() {
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <CallsHeader/>
      <CallHistory/>
    </div>
  );
}
