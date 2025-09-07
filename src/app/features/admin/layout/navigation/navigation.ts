// side bar
export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'default',
    title: 'Tổng quan',
    type: 'item',
    classes: 'nav-item',
    url: '/admin',
    icon: 'ti ti-dashboard',
    breadcrumbs: false
  },
  {
    id: 'elements',
    title: 'Quản lý',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'typography',
        title: 'Dạng câu hỏi',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/question-type',
        icon: 'ti ti-typography'
      },
      {
        id: 'color',
        title: 'Câu hỏi',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/question',
        icon: 'ti ti-brush'
      },
      {
        id: 'tabler',
        title: 'Lộ trình',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/roadmap',
        icon: 'ti ti-plant-2',
        target: true,
        external: true
      }
    ]
  }
];
