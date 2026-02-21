"use client";

import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  GraduationCap,
  Tags,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

const superAdminNav: NavItem[] = [
  { title: "Kelola Pengguna", url: "/admin/users", icon: Users },
];

const contentNav: NavItem[] = [
  { title: "Artikel", url: "/admin/articles", icon: FileText },
  { title: "Event", url: "/admin/events", icon: CalendarDays },
  { title: "Info Akademik", url: "/admin/academic", icon: GraduationCap },
  { title: "Tags", url: "/admin/tags", icon: Tags },
];

const systemNav: NavItem[] = [
  { title: "Admin Logs", url: "/admin/logs", icon: ScrollText },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            item.url === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string; role: string };
}) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#FF6E00] text-white font-heading font-bold text-xs">
                  P
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold font-heading">
                    PATRA
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Utama" items={mainNav} />
        {user.role === "SUPER_ADMIN" && (
          <NavGroup label="Super Admin" items={superAdminNav} />
        )}
        <NavGroup label="Konten" items={contentNav} />
        <NavGroup label="Sistem" items={systemNav} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
