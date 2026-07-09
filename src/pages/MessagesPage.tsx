import { Search, Send } from 'lucide-react'

const conversations = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    message: 'Tasarım revizyonları tamamlandı, inceleyebilir misiniz?',
    time: '2 dk',
    unread: 2,
    avatar: 'AY',
    color: 'bg-indigo-500',
    active: true,
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    message: 'API endpoint\'leri hazır, dokümantasyonu paylaştım.',
    time: '18 dk',
    unread: 0,
    avatar: 'MK',
    color: 'bg-cyan-500',
    active: false,
  },
  {
    id: 3,
    name: 'Proje: E-Ticaret',
    message: 'Can: Sprint planlaması için toplantı ayarlayalım.',
    time: '1 sa',
    unread: 1,
    avatar: 'ET',
    color: 'bg-violet-500',
    active: false,
  },
  {
    id: 4,
    name: 'Zeynep Demir',
    message: 'Component kütüphanesi güncellendi.',
    time: '3 sa',
    unread: 0,
    avatar: 'ZD',
    color: 'bg-emerald-500',
    active: false,
  },
]

const chatMessages = [
  { from: 'them', text: 'Merhaba! E-ticaret projesinin ana sayfa tasarımını güncelledim.', time: '14:32' },
  { from: 'me', text: 'Harika, hemen bakıyorum. Renk paleti çok iyi oturmuş.', time: '14:35' },
  { from: 'them', text: 'Teşekkürler! Mobil versiyonu da ekledim, responsive test edebilir misiniz?', time: '14:38' },
  { from: 'me', text: 'Tabii, bu akşam kontrol edip geri bildirim vereceğim.', time: '14:40' },
  { from: 'them', text: 'Tasarım revizyonları tamamlandı, inceleyebilir misiniz?', time: '14:52' },
]

export function MessagesPage() {
  return (
    <div className="glass flex h-[calc(100vh-12rem)] overflow-hidden rounded-2xl">
      <div className="w-80 shrink-0 border-r border-white/6">
        <div className="border-b border-white/6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Mesajlarda ara..."
              className="w-full rounded-xl border border-white/6 bg-white/3 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-indigo-500/40"
            />
          </div>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`flex w-full items-start gap-3 border-b border-white/4 p-4 text-left transition hover:bg-white/3 ${
                conv.active ? 'bg-indigo-500/8' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${conv.color} text-xs font-bold text-white`}
              >
                {conv.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{conv.name}</span>
                  <span className="text-[10px] text-zinc-600">{conv.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{conv.message}</p>
              </div>
              {conv.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/6 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            AY
          </div>
          <div>
            <p className="font-medium text-white">Ayşe Yılmaz</p>
            <p className="text-xs text-emerald-400">Çevrimiçi</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.from === 'me'
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                    : 'bg-white/5 text-zinc-300'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.from === 'me' ? 'text-indigo-200' : 'text-zinc-600'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              className="flex-1 rounded-xl border border-white/6 bg-white/3 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-indigo-500/40"
            />
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-indigo-500">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
