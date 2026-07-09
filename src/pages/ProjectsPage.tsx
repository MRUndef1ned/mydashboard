import { Plus, MoreHorizontal } from 'lucide-react'

const projects = [
  {
    name: 'E-Ticaret Platformu',
    status: 'Devam Ediyor',
    progress: 72,
    team: ['AY', 'MK', 'ZD'],
    deadline: '15 Ağu 2026',
    color: 'from-indigo-500/20 to-cyan-500/5',
  },
  {
    name: 'Mobil Uygulama',
    status: 'İncelemede',
    progress: 45,
    team: ['CÖ', 'EA'],
    deadline: '28 Tem 2026',
    color: 'from-violet-500/20 to-purple-500/5',
  },
  {
    name: 'Kurumsal Web Sitesi',
    status: 'Tamamlandı',
    progress: 100,
    team: ['MK', 'ZD', 'AY', 'EA'],
    deadline: '01 Tem 2026',
    color: 'from-emerald-500/20 to-teal-500/5',
  },
  {
    name: 'API Entegrasyonu',
    status: 'Planlama',
    progress: 15,
    team: ['CÖ'],
    deadline: '30 Eyl 2026',
    color: 'from-amber-500/20 to-orange-500/5',
  },
  {
    name: 'Marka Yenileme',
    status: 'Devam Ediyor',
    progress: 58,
    team: ['ZD', 'EA'],
    deadline: '20 Ağu 2026',
    color: 'from-rose-500/20 to-pink-500/5',
  },
  {
    name: 'Veri Migrasyonu',
    status: 'Devam Ediyor',
    progress: 33,
    team: ['MK', 'CÖ', 'AY'],
    deadline: '10 Eyl 2026',
    color: 'from-cyan-500/20 to-blue-500/5',
  },
]

const statusColors: Record<string, string> = {
  'Devam Ediyor': 'bg-indigo-500/10 text-indigo-400',
  'İncelemede': 'bg-amber-500/10 text-amber-400',
  'Tamamlandı': 'bg-emerald-500/10 text-emerald-400',
  'Planlama': 'bg-zinc-500/10 text-zinc-400',
}

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{projects.length} aktif proje</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500">
          <Plus className="h-4 w-4" />
          Yeni Proje
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.name}
            className={`group glass rounded-2xl bg-gradient-to-br ${project.color} p-5 transition hover:border-white/10`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{project.name}</h3>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColors[project.status]}`}
                >
                  {project.status}
                </span>
              </div>
              <button className="rounded-lg p-1 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-300">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-500">İlerleme</span>
                <span className="font-medium text-white">%{project.progress}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.team.map((member) => (
                  <div
                    key={member}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-2 bg-indigo-500 text-[9px] font-bold text-white"
                  >
                    {member}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-zinc-500">{project.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
