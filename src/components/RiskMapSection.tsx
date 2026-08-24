import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const RiskMapView = lazy(() => import("./RiskMapView"));

const MapFallback = () => (
  <section id="mapa" className="py-16">
    <div className="container mx-auto px-4">
      <div className="h-[420px] rounded-2xl border border-border bg-card shadow-card animate-pulse" />
    </div>
  </section>
);

const RiskMapSection = () => (
  <ClientOnly fallback={<MapFallback />}>
    <Suspense fallback={<MapFallback />}>
      <RiskMapView />
    </Suspense>
  </ClientOnly>
);

export default RiskMapSection;
