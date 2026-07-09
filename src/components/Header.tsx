import { Bell, Search, Plus, Menu } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/6 bg-surface-0/60 px-8 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Genel Bakış
          </h2>
          <p className="text-sm text-zinc-500">
            Hoş geldiniz, işletmenizin performansını takip edin.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Ara..."
            className="w-64 rounded-xl border border-white/6 bg-white/3 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-indigo-500/40 focus:bg-white/5 focus:ring-2 focus:ring-indigo-500/15"
          />
          <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 lg:inline">
            ⌘K
          </kbd>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Yeni Proje</span>
        </button>

        <button className="relative rounded-xl border border-white/6 bg-white/3 p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface-0" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 py-1.5 pl-1.5 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
            AK
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-200">Ali Korkmaz</p>
            <p className="text-[11px] text-zinc-500">Yönetici</p>
          </div>
        </div>
      </div>
    </header>
  )
}
