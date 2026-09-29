<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Sem animações framer-motion de entrada entre páginas: `MotionGlobalConfig.skipAnimations = true` em `src/routes/__root.tsx`. Why: usuário achou a transição repetitiva; MotionConfig duration 0 não basta pois componentes têm `transition` própria.
