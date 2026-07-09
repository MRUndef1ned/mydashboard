export interface NavItem {
  id: string
  label: string
  icon: string
  active?: boolean
  badge?: number
}

export const navItems: NavItem[] = [
  { id: 'overview', label: 'Genel Bakış', icon: 'layout-dashboard', active: true },
  { id: 'analytics', label: 'Analitik', icon: 'bar-chart-3' },
  { id: 'projects', label: 'Projeler', icon: 'folder-kanban' },
  { id: 'team', label: 'Ekip', icon: 'users' },
  { id: 'messages', label: 'Mesajlar', icon: 'message-square', badge: 3 },
  { id: 'settings', label: 'Ayarlar', icon: 'settings' },
]

export const stats = [
  {
    id: 'revenue',
    label: 'Toplam Gelir',
    value: '₺284.520',
    change: '+12.5%',
    trend: 'up' as const,
    icon: 'wallet',
    gradient: 'from-indigo-500/20 to-cyan-500/10',
    accent: 'text-cyan-400',
  },
  {
    id: 'users',
    label: 'Aktif Kullanıcı',
    value: '12.847',
    change: '+8.2%',
    trend: 'up' as const,
    icon: 'users',
    gradient: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-400',
  },
  {
    id: 'orders',
    label: 'Siparişler',
    value: '1.429',
    change: '-2.4%',
    trend: 'down' as const,
    icon: 'shopping-bag',
    gradient: 'from-rose-500/20 to-orange-500/10',
    accent: 'text-rose-400',
  },
  {
    id: 'conversion',
    label: 'Dönüşüm Oranı',
    value: '%3.24',
    change: '+0.8%',
    trend: 'up' as const,
    icon: 'trending-up',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    accent: 'text-emerald-400',
  },
]

export const chartData = [
  { month: 'Oca', value: 42 },
  { month: 'Şub', value: 58 },
  { month: 'Mar', value: 45 },
  { month: 'Nis', value: 72 },
  { month: 'May', value: 68 },
  { month: 'Haz', value: 85 },
  { month: 'Tem', value: 78 },
  { month: 'Ağu', value: 92 },
  { month: 'Eyl', value: 88 },
  { month: 'Eki', value: 95 },
  { month: 'Kas', value: 102 },
  { month: 'Ara', value: 118 },
]

export const activities = [
  {
    id: 1,
    user: 'Ayşe Yılmaz',
    action: 'yeni proje oluşturdu',
    target: 'E-Ticaret Platformu',
    time: '2 dk önce',
    avatar: 'AY',
    color: 'bg-indigo-500',
  },
  {
    id: 2,
    user: 'Mehmet Kaya',
    action: 'rapor paylaştı',
    target: 'Q3 Analiz',
    time: '15 dk önce',
    avatar: 'MK',
    color: 'bg-cyan-500',
  },
  {
    id: 3,
    user: 'Zeynep Demir',
    action: 'görev tamamladı',
    target: 'UI Tasarım Revizyonu',
    time: '1 saat önce',
    avatar: 'ZD',
    color: 'bg-emerald-500',
  },
  {
    id: 4,
    user: 'Can Öztürk',
    action: 'yorum ekledi',
    target: 'Mobil Uygulama',
    time: '2 saat önce',
    avatar: 'CÖ',
    color: 'bg-amber-500',
  },
  {
    id: 5,
    user: 'Elif Arslan',
    action: 'dosya yükledi',
    target: 'brand-guidelines.pdf',
    time: '3 saat önce',
    avatar: 'EA',
    color: 'bg-rose-500',
  },
]

export const transactions = [
  {
    id: 'TXN-4821',
    customer: 'TechCorp Ltd.',
    amount: '₺24.500',
    status: 'Tamamlandı',
    statusColor: 'emerald',
    date: '09 Tem 2026',
    method: 'Kredi Kartı',
  },
  {
    id: 'TXN-4820',
    customer: 'Design Studio',
    amount: '₺8.750',
    status: 'Beklemede',
    statusColor: 'amber',
    date: '09 Tem 2026',
    method: 'Havale',
  },
  {
    id: 'TXN-4819',
    customer: 'StartupHub',
    amount: '₺15.200',
    status: 'Tamamlandı',
    statusColor: 'emerald',
    date: '08 Tem 2026',
    method: 'Kredi Kartı',
  },
  {
    id: 'TXN-4818',
    customer: 'MediaFlow',
    amount: '₺3.400',
    status: 'İptal',
    statusColor: 'rose',
    date: '08 Tem 2026',
    method: 'PayPal',
  },
  {
    id: 'TXN-4817',
    customer: 'CloudNine',
    amount: '₺42.100',
    status: 'Tamamlandı',
    statusColor: 'emerald',
    date: '07 Tem 2026',
    method: 'Kredi Kartı',
  },
]

export const performanceMetrics = [
  { label: 'Sunucu Uptime', value: 99.9, color: '#34d399' },
  { label: 'API Yanıt Süresi', value: 87, color: '#6366f1' },
  { label: 'Önbellek Hit', value: 94, color: '#22d3ee' },
]
