export interface NavItem {
  id: string
  path: string
  label: string
  description: string
  icon: string
  badge?: number
}

export const navItems: NavItem[] = [
  {
    id: 'overview',
    path: '/',
    label: 'Genel Bakış',
    description: 'İşletmenizin performansını tek bakışta takip edin.',
    icon: 'layout-dashboard',
  },
  {
    id: 'stocks',
    path: '/stocks',
    label: 'Borsa',
    description: 'BIST ve ABD borsalarından canlı hisse fiyatları.',
    icon: 'line-chart',
  },
  {
    id: 'portfolio',
    path: '/portfolio',
    label: 'Portföy',
    description: 'Hisse alımlarınızı, maliyetinizi ve kâr/zararı takip edin.',
    icon: 'wallet-cards',
  },
  {
    id: 'analytics',
    path: '/analytics',
    label: 'Analitik',
    description: 'Detaylı metrikler ve trend analizleri.',
    icon: 'bar-chart-3',
  },
  {
    id: 'projects',
    path: '/projects',
    label: 'Projeler',
    description: 'Tüm projelerinizi yönetin ve takip edin.',
    icon: 'folder-kanban',
  },
  {
    id: 'notes',
    path: '/notes',
    label: 'Notlar',
    description: 'Notion tarzı sayfalar, günlük ve blok editörü.',
    icon: 'notebook-pen',
  },
  {
    id: 'team',
    path: '/team',
    label: 'Ekip',
    description: 'Ekip üyelerinizi görüntüleyin ve yönetin.',
    icon: 'users',
  },
  {
    id: 'messages',
    path: '/messages',
    label: 'Mesajlar',
    description: 'Ekip içi mesajlaşma ve bildirimler.',
    icon: 'message-square',
    badge: 3,
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Ayarlar',
    description: 'Hesap ve uygulama tercihlerinizi düzenleyin.',
    icon: 'settings',
  },
]

export function getNavItemByPath(pathname: string): NavItem {
  return navItems.find((item) => item.path === pathname) ?? navItems[0]
}
