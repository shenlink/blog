// 定义 SidebarItem 的类型
export interface SidebarItem {
    text: string;
    link?: string;
    collapsed?: boolean;
    items?: SidebarItem[];
}

export type Sidebar = { [key: string]: SidebarItem[] };

export type CategoryNamesConfig = { [key: string]: { [key: string]: string } }

export type CategoryOrdersConfig = { [key: string]: string[] }

export type CategoryNames = { [key: string]: string }