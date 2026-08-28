import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

/**
 * O mapa colaborativo usa Leaflet, que só funciona no navegador — por isso o
 * módulo é importado dinamicamente e renderizado apenas depois da hidratação.
 */
const LiveMapView = lazy(() => import("./LiveMapView"));

const Fallback = () => (
  <div className="grid gap-4 lg:grid-cols-3">
    <div className="h-[420px] animate-pulse rounded-xl border border-border bg-card sm:h-[560px] lg:col-span-2" />
    <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
  </div>
);

const LiveMapSection = () => (
  <ClientOnly fallback={<Fallback />}>
    <Suspense fallback={<Fallback />}>
      <LiveMapView />
    </Suspense>
  </ClientOnly>
);

export default LiveMapSection;
