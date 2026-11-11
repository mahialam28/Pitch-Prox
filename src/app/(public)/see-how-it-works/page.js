import Link from "next/link";
import Image from "next/image";
import VideoReady from "@/components/demo/video-ready";
import logo from "@/assets/logos/blue-logo.png";

export const metadata = {
  title: "See How PitchProX Works",
  description: "Watch how PitchProX gives you the right words during live sales calls, then start free.",
};

// The emailed link: the same "Your Video Is Ready" view as the website pop-up (?r = the request, for watch tracking)
export default async function SeeHowItWorksPage({ searchParams }) {
  const { r } = await searchParams;
  return (
    <main className="min-h-screen bg-light-gray px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-block mb-6" aria-label="PitchProX home">
          <Image src={logo} alt="PitchProX" className="h-auto w-[200px]" priority />
        </Link>
        <div className="rounded-3xl bg-light-gray">
          <VideoReady requestId={typeof r === "string" ? r : null} emailed={false} />
        </div>
      </div>
    </main>
  );
}
