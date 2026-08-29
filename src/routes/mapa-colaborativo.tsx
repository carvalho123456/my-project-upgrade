import { createFileRoute } from "@tanstack/react-router";
import MapaColaborativo from "@/pages/MapaColaborativo";

export const Route = createFileRoute("/mapa-colaborativo")({
  head: () => ({
    meta: [
      { title: "Mapa colaborativo de riscos em Caraguatatuba" },
      {
        name: "description",
        content:
          "Alagamentos, deslizamentos, quedas de árvore e ruas interditadas relatados em tempo real pelos moradores de Caraguatatuba, com confirmação coletiva.",
      },
      { property: "og:title", content: "Mapa colaborativo de riscos em Caraguatatuba" },
      {
        property: "og:description",
        content:
          "Veja e relate ocorrências de chuva e infraestrutura na sua rua. Alertas colaborativos com validade temporária.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapaColaborativo,
});
