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

- Componentes de página usam `initial={false}` e o `MotionConfig` mantém duração zero; não use `MotionGlobalConfig.skipAnimations`, pois ele também bloqueia mudanças visuais do tema climático. Why: a navegação deve ser instantânea sem remover as cores dinâmicas.
