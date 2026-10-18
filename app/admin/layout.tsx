import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace privé", template: "%s | Espace privé · Pour Clément" },
  robots: { index: false, follow: false },
};

/* L’espace privé n’a ni le menu ni les animations du site public */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
