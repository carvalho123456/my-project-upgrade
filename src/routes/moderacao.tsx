import { createFileRoute } from "@tanstack/react-router";
import Moderation from "@/pages/Moderation";

export const Route = createFileRoute("/moderacao")({
  head: () => ({
    meta: [
      { title: "Moderação de relatos | Caraguatatuba Flood Guardian" },
      {
        name: "description",
        content: "Painel de moderação para aprovar ou rejeitar relatos enviados pela comunidade.",
      },
      { property: "og:title", content: "Moderação de relatos" },
      { property: "og:description", content: "Aprove ou rejeite relatos da comunidade de Caraguatatuba." },
    ],
  }),
  component: Moderation,
});
