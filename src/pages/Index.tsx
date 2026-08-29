import Header from "@/components/Header";
import AlertBanner from "@/components/AlertBanner";
import NotificationOptIn from "@/components/NotificationOptIn";
import HeroSection from "@/components/HeroSection";
import ForecastSection from "@/components/ForecastSection";

import MoonSection from "@/components/MoonSection";
import RiskMapSection from "@/components/RiskMapSection";
import LiveMapTeaser from "@/components/livemap/LiveMapTeaser";
import DisasterEducation from "@/components/DisasterEducation";
import FloodSection from "@/components/FloodSection";
import LandslideSection from "@/components/LandslideSection";
import EnvironmentSection from "@/components/EnvironmentSection";
import TimelineSection from "@/components/TimelineSection";
import ReportsSection from "@/components/ReportsSection";
import EmergencyGuide from "@/components/EmergencyGuide";
import PreventionSection from "@/components/PreventionSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <HeroSection />
    <AlertBanner />
    <NotificationOptIn />
    <ForecastSection />
    
    <MoonSection />

    <RiskMapSection />
    <LiveMapTeaser />
    <DisasterEducation />
    <FloodSection />
    <LandslideSection />
    <EnvironmentSection />
    <TimelineSection />
    <ReportsSection />
    <EmergencyGuide />
    <PreventionSection />
      <Footer />
      <ScrollToTop />
    </div>
);

export default Index;
