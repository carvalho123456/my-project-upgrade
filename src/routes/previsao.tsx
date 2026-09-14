import { createFileRoute } from "@tanstack/react-router";
import ForecastArchive from "@/pages/ForecastArchive";

export const Route = createFileRoute("/previsao")({
  head: () => ({
    meta: [
      { title: "Previsão por dia | Clima Caragua" },
      { name: "description", content: "Consulte a previsão e o histórico recente do tempo em Caraguatatuba por data." },
      { property: "og:title", content: "Previsão por dia | Clima Caragua" },
      { property: "og:description", content: "Veja dias anteriores e a previsão disponível para Caraguatatuba." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForecastArchive,
});