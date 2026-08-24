import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | Caraguatatuba Flood Guardian" },
      {
        name: "description",
        content: "Acesse sua conta para enviar relatos de alagamentos e deslizamentos em Caraguatatuba.",
      },
      { property: "og:title", content: "Entrar | Caraguatatuba Flood Guardian" },
      { property: "og:description", content: "Acesse sua conta para enviar relatos na sua região." },
    ],
  }),
  component: AuthPage,
});
