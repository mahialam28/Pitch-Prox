import AdaptConversation from "./components/adapt-conversation";
import Conversation from "./components/conversation";
import Demo from "./components/demo";
import FAQ from "./components/faq";
import Footer from "./components/footer";
import Guidance from "./components/guidance";
import Header from "./components/header";
import Hero from "./components/hero";
import SeeHowItWorks from "./components/how-it-works";
import Pricing from "./components/pricing";
import { EmailProvider } from "./components/email-context";

const HomePage = () => {
  return (
    <EmailProvider>
      <div className="w-full">
        <div className="min-h-screen flex flex-col">
          {/* Navigation Header */}
          <Header />

          {/* Main Content Area - pt for fixed header offset */}
          <main className="flex-1 pt-[80px] lg:pt-[100px] mb-12">
            {/* Hero Section */}
            <Hero />
            
            {/* Conversation Section */}
            <Conversation />

            {/* Conversation Adaptation Section */}
            <AdaptConversation/>
            
            {/* Pricing Section */}
            <Pricing />

            {/* guidance Section */}
            <Guidance/>
            
            {/* Book a Demo Section */}

            <Demo />
            
            {/* how it works Section */}
            <SeeHowItWorks />

            {/* FAQ Section */}
            <FAQ />

          </main>
        </div>
      </div>

      <Footer />
    </EmailProvider>
  );
};

export default HomePage;