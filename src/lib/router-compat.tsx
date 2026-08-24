import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type BaseProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
};

function useHrefNavigate() {
  const router = useRouter();
  return (href: string, replace?: boolean) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.navigate({ href, replace } as never);
  };
}

export const Link = forwardRef<HTMLAnchorElement, BaseProps>(
  ({ to, replace, onClick, ...props }, ref) => {
    const navigate = useHrefNavigate();
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to, replace);
    };
    return <a ref={ref} href={to} onClick={handleClick} {...props} />;
  },
);
Link.displayName = "Link";

type NavLinkProps = BaseProps & {
  activeClassName?: string;
  pendingClassName?: string;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, to, pendingClassName: _pending, ...props }, ref) => {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const isActive = pathname === to.split("#")[0];
    return (
      <Link
        ref={ref}
        to={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);
NavLink.displayName = "NavLink";

export function useNavigate() {
  const navigate = useHrefNavigate();
  return (to: string, options?: { replace?: boolean }) => navigate(to, options?.replace);
}
