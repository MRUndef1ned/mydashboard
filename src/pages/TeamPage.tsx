import { Mail, MoreHorizontal } from 'lucide-react'

const members = [
  { name: 'Ayşe Yılmaz', role: 'UI/UX Tasarımcı', email: 'ayse@nexus.com', status: 'Çevrimiçi', avatar: 'AY', color: 'from-indigo-500 to-indigo-600' },
  { name: 'Mehmet Kaya', role: 'Backend Geliştirici', email: 'mehmet@nexus.com', status: 'Çevrimiçi', avatar: 'MK', color: 'from-cyan-500 to-cyan-600' },
  { name: 'Zeynep Demir', role: 'Frontend Geliştirici', email: 'zeynep@nexus.com', status: 'Meşgul', avatar: 'ZD', color: 'from-violet-500 to-violet-600' },
  { name: 'Can Öztürk', role: 'Proje Yöneticisi', email: 'can@nexus.com', status: 'Çevrimdışı', avatar: 'CÖ', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Elif Arslan', role: 'Pazarlama Uzmanı', email: 'elif@nexus.com', status: 'Çevrimiçi', avatar: 'EA', color: 'from-rose-500 to-rose-600' },
  { name: 'Ali Korkmaz', role: 'Yönetici', email: 'ali@nexus.com', status: 'Çevrimiçi', avatar: 'AK', color: 'from-amber-500 to-amber-600' },
]

const statusDot: Record<string, string> = {
  'Çevrimiçi': 'bg-emerald-400',
  'Meşgul': 'bg-amber-400',
  'Çevrimdışı': 'bg-zinc-600',
}

export function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Toplam Üye', value: '6' },
          { label: 'Çevrimiçi', value: '4' },
          { label: 'Aktif Proje', value: '12' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div key={member.email} className="glass group rounded-2xl p-5 transition hover:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${member.color} text-sm font-bold text-white shadow-lg`}
                >
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-zinc-500">{member.role}</p>
                </div>
              </div>
              <button className="rounded-lg p-1 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Mail className="h-3.5 w-3.5" />
                {member.email}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${statusDot[member.status]}`} />
                <span className="text-[11px] text-zinc-500">{member.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
