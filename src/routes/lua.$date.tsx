import { createFileRoute } from "@tanstack/react-router";
import MoonDay from "@/pages/MoonDay";

export const Route = createFileRoute("/lua/$date")({
  head: () => ({
    meta: [
      { title: "Fase da Lua e marés | Caraguatatuba" },
      {
        name: "description",
        content: "Fase lunar, iluminação, nascer e pôr da Lua e influência nas marés de Caraguatatuba.",
      },
      { property: "og:title", content: "Fase da Lua e marés | Caraguatatuba" },
      { property: "og:description", content: "Veja a Lua do dia e sua influência nas marés." },
    ],
  }),
  component: MoonDay,
});
