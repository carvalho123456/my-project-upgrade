import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caraguatatuba Flood Guardian | Alertas de enchente e deslizamento" },
      {
        name: "description",
        content:
          "Previsão do tempo, alertas de enchentes e deslizamentos, mapa de risco e relatos da comunidade em Caraguatatuba.",
      },
      { property: "og:title", content: "Caraguatatuba Flood Guardian" },
      {
        property: "og:description",
        content:
          "Monitore chuvas, riscos de alagamento e deslizamento em Caraguatatuba em tempo real.",
      },
    ],
  }),
  component: Index,
});
