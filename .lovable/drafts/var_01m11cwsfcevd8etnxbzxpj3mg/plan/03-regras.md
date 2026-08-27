## Validade temporária (TTL por tipo)

Cada tipo tem um prazo base, contado desde a **última confirmação**, não desde a criação:

| Ocorrência | Prazo base |
| --- | --- |
| Enxurrada / correnteza | 2 h |
| Alagamento | 4 h |
| Queda de energia, árvore, poste | 8 h |
| Rua interditada | 12 h |
| Deslizamento, risco de deslizamento, danos estruturais | 48 h |

Uma confirmação "continua" reinicia o relógio. "Melhorou" encurta o prazo pela metade. Duas respostas "não encontrei" independentes e recentes derrubam o alerta direto para expirado. Entre 1× e 2× do prazo o alerta aparece esmaecido e marcado como "não confirmado recentemente"; depois some do mapa e vai para o histórico.

## Confiabilidade (0–100)

Não é contagem de relatos. Combina quatro fatores:

- **Recência** — peso maior para confirmações das últimas horas, decaindo suavemente.
- **Independência** — cada pessoa conta uma vez; confirmações de um mesmo usuário não somam.
- **Proximidade** — confirmações feitas perto do ponto relatado pesam mais que remotas.
- **Consistência** — "continua" soma, "melhorou" atenua, "não encontrei" subtrai.

Exibido em três faixas: *baixa* (relato único, não confirmado), *média*, *alta* (várias confirmações recentes e próximas). A faixa aparece sempre junto do texto "informação colaborativa, pode estar desatualizada".

## Cores nas vias e áreas

Cor = gravidade informada, reforçada pela confiabilidade e pela densidade de relatos próximos:

- amarelo — atenção
- laranja — risco elevado
- vermelho escuro — grave, possivelmente intransitável

Quando vários relatos do mesmo tipo caem num raio curto, a área ganha um círculo de intensidade maior. Nunca é dito que a via está "lenta" ou "bloqueada": o texto é "interdição relatada" ou "possivelmente afetada".

## Privacidade

- Localização só é lida **por clique**, nunca em segundo plano.
- O ponto público do relato é arredondado (≈100 m); a coordenada exata do celular nunca é publicada.
- Relatos são exibidos de forma anônima; a autoria fica só no banco, para moderação.
- Notificações de área de risco são opt-in explícito e sempre trazem o aviso sobre órgãos oficiais.

## Anti-abuso e moderação

- Limite de envios: 1 relato do mesmo tipo por pessoa a cada 10 minutos, e no máximo 1 relato por tipo dentro de ~150 m.
- Uma pessoa confirma cada alerta uma única vez (pode trocar a resposta).
- Botão de denúncia em cada alerta; alerta muito denunciado é ocultado até revisão.
- O painel de moderação existente ganha uma aba para os alertas colaborativos: ocultar, expirar, remover.
- Todo relato, confirmação, edição e ação de moderação fica registrado em histórico.
