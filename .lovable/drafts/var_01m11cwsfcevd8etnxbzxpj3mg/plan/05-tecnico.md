## Modelo de dados

Quatro tabelas novas, sem tocar nas existentes:

- **live_alerts** — tipo, gravidade (baixo/moderado/alto/crítico), ponto aproximado (lat/lng arredondados), bairro, descrição, mídia, autor, criação, última confirmação, expiração, status (ativo / esmaecendo / expirado / oculto), contadores e pontuação de confiança.
- **alert_confirmations** — alerta, usuário, resposta (continua / melhorou / não encontrei), distância aproximada, data. Única por usuário e alerta.
- **alert_reports_abuse** — denúncias, com motivo e status de revisão.
- **alert_audit_log** — histórico de criação, confirmação, mudança de status e ações de moderação.

Tudo com RLS: leitura pública apenas de alertas visíveis e de colunas seguras (sem autor, sem coordenada exata); escrita apenas autenticada e ligada ao próprio usuário; moderadores usam a função `is_moderator` já existente. Um bucket de armazenamento público para as fotos/vídeos dos relatos, com upload restrito a usuários autenticados.

## Arquitetura

- Cálculo de confiança e expiração em funções no banco, disparadas por gatilho a cada relato/confirmação, mais uma varredura periódica que esmaece e arquiva o que passou do prazo. Assim a regra é a mesma para qualquer cliente.
- Leitura pública via uma visão que só expõe campos seguros.
- Atualização em tempo real por assinatura na tabela de alertas, com recarga leve a cada minuto para refletir o decaimento.
- Módulos de frontend novos e isolados: mapa colaborativo (Leaflet, carregado só no navegador), formulário de relato, painel de detalhe/confirmação, filtros, legenda e catálogo de tipos/cores/TTL num único arquivo de configuração.
- Nova rota `/mapa-colaborativo` com metadados próprios, link no menu, e um bloco de destaque na home apontando para ela. `RiskMapView` (mapa técnico) fica como está.
- Notificações de proximidade reaproveitam o componente de opt-in já existente.
- Dados simulados de Caraguatatuba entram junto com a estrutura, em vários tipos e níveis, para o mapa já nascer populado.

Observação: a estrutura de banco é preparada agora e passa a valer quando você aceitar este rascunho no projeto; até lá o mapa colaborativo não consegue ler ou gravar dados de verdade aqui na pré-visualização.
