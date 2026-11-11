"use client";

import Link from "next/link";
import { useSyncExternalStore, type ComponentProps } from "react";

type HomeLinkProps = Omit<ComponentProps<typeof Link>, "href">;

const subscribe = () => () => {};

function getSnapshot() {
  return document.documentElement.getAttribute("data-kali-desktop") === "true";
}

function getServerSnapshot() {
  return false;
}

/**
 * Points at the desktop start page inside the Electron shell and at the normal
 * landing page everywhere else. The data attribute is set before paint by the
 * script in app/layout.tsx.
 */
export function HomeLink({ children, ...props }: HomeLinkProps) {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <Link href={isDesktop ? "/desktop" : "/"} {...props}>
      {children}
    </Link>
  );
}
