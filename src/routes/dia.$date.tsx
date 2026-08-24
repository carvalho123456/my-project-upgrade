import { createFileRoute } from "@tanstack/react-router";
import DayDetail from "@/pages/DayDetail";

export const Route = createFileRoute("/dia/$date")({
  head: () => ({
    meta: [
      { title: "Previsão detalhada do dia | Caraguatatuba" },
      {
        name: "description",
        content: "Chuva hora a hora, temperatura, vento, nascer e pôr do sol para o dia escolhido em Caraguatatuba.",
      },
      { property: "og:title", content: "Previsão detalhada do dia | Caraguatatuba" },
      { property: "og:description", content: "Chuva hora a hora e condições do dia em Caraguatatuba." },
    ],
  }),
  component: DayDetail,
});
