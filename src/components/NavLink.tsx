import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  prefetch?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, prefetch = true, ...props }, ref) => {
    const handleMouseEnter = useCallback(() => {
      if (!prefetch || typeof to !== "string") return;
      // Hint the browser to prefetch the route's chunk
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = to;
      // Avoid duplicate prefetch links
      if (!document.querySelector(`link[rel="prefetch"][href="${to}"]`)) {
        document.head.appendChild(link);
      }
    }, [to, prefetch]);

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onMouseEnter={handleMouseEnter}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
