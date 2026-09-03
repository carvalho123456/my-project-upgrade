import { createFileRoute } from "@tanstack/react-router";
import NextDays from "@/pages/NextDays";

export const Route = createFileRoute("/proximos-dias")({
  head: () => ({
    meta: [
      { title: "Próximos dias | Previsão em Caraguatatuba" },
      {
        name: "description",
        content: "Consulte a previsão estendida, temperaturas e chuva para os próximos dias em Caraguatatuba.",
      },
      { property: "og:title", content: "Próximos dias | Clima Caragua" },
      {
        property: "og:description",
        content: "Previsão estendida e detalhes do clima para Caraguatatuba.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NextDays,
});