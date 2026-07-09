import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { Bell, Lock, User, Shield } from 'lucide-react'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { addToast } = useUI()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Profil Bilgileri</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Ad Soyad</label>
            <input
              defaultValue={user?.name}
              className="w-full rounded-xl border border-white/6 bg-white/3 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">E-posta</label>
            <input
              defaultValue={user?.email}
              className="w-full rounded-xl border border-white/6 bg-white/3 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Rol</label>
            <input
              defaultValue={user?.role}
              disabled
              className="w-full rounded-xl border border-white/6 bg-white/3 px-4 py-2.5 text-sm text-zinc-500 outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => addToast('Profil bilgileri kaydedildi.')}
          className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500"
        >
          Değişiklikleri Kaydet
        </button>
      </section>

      <section className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Bildirimler</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'email' as const, label: 'E-posta bildirimleri', desc: 'Önemli güncellemeler için e-posta al' },
            { key: 'push' as const, label: 'Anlık bildirimler', desc: 'Tarayıcı push bildirimleri' },
            { key: 'weekly' as const, label: 'Haftalık özet', desc: 'Her pazartesi performans raporu' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-xl border border-white/6 p-4 transition hover:bg-white/3"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[item.key]}
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                }
                className={`relative h-6 w-11 rounded-full transition ${
                  notifications[item.key] ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    notifications[item.key] ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-violet-400" />
          <h3 className="text-base font-semibold text-white">Güvenlik</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full rounded-xl border border-white/6 p-4 text-left transition hover:bg-white/3">
            <p className="text-sm font-medium text-white">Şifre Değiştir</p>
            <p className="text-xs text-zinc-500">Son değişiklik: 30 gün önce</p>
          </button>
          <button className="w-full rounded-xl border border-white/6 p-4 text-left transition hover:bg-white/3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium text-white">İki Faktörlü Doğrulama</p>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Hesabınıza ekstra güvenlik katmanı ekleyin</p>
          </button>
        </div>
      </section>

      <button
        onClick={logout}
        className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 py-3 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10"
      >
        Çıkış Yap
      </button>
    </div>
  )
}
