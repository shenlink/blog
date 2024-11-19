// 定义 SidebarItem 的类型
export interface SidebarItem {
    text: string;
    link?: string;
    collapsed?: boolean;
    items?: SidebarItem[];
}

export type Sidebar = { [key: string]: SidebarItem[] };