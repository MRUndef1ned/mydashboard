export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning'
}

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'Yeni sipariş',
    message: 'TechCorp Ltd. ₺24.500 tutarında sipariş verdi.',
    time: '2 dk önce',
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Proje güncellendi',
    message: 'E-Ticaret Platformu %72 tamamlandı.',
    time: '18 dk önce',
    read: false,
    type: 'info',
  },
  {
    id: '3',
    title: 'Yeni mesaj',
    message: 'Ayşe Yılmaz tasarım revizyonlarını paylaştı.',
    time: '1 saat önce',
    read: false,
    type: 'info',
  },
  {
    id: '4',
    title: 'Ödeme beklemede',
    message: 'Design Studio ödemesi onay bekliyor.',
    time: '3 saat önce',
    read: true,
    type: 'warning',
  },
  {
    id: '5',
    title: 'Sistem güncellemesi',
    message: 'API v2.4 başarıyla yüklendi.',
    time: 'Dün',
    read: true,
    type: 'success',
  },
]
