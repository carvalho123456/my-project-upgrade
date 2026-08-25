import { createFileRoute } from "@tanstack/react-router";
import FenomenosPage from "@/pages/Fenomenos";

export const Route = createFileRoute("/el-nino-la-nina")({
  head: () => ({
    meta: [
      { title: "El Niño e La Niña — Clima Caragua" },
      {
        name: "description",
        content:
          "Entenda o que são El Niño e La Niña, como funcionam e por que esses fenômenos influenciam o clima em Caraguatatuba e no litoral norte de São Paulo.",
      },
      { property: "og:title", content: "El Niño e La Niña — Clima Caragua" },
      {
        property: "og:description",
        content:
          "O aquecimento e o resfriamento do Pacífico equatorial explicados de forma simples.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FenomenosPage,
});
