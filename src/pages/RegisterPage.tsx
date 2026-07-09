import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'

export function RegisterPage() {
  const { register } = useAuth()
  const { addToast } = useUI()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await register(name, email, password)
    setIsSubmitting(false)

    if (result.success) {
      addToast('Hesabınız oluşturuldu. Hoş geldiniz!')
      navigate('/', { replace: true })
    } else {
      setError(result.error ?? 'Kayıt başarısız.')
    }
  }

  return (
    <div className="glass glow-accent rounded-2xl p-8">
      <h2 className="mb-1 text-xl font-semibold text-white">Kayıt Ol</h2>
      <p className="mb-6 text-sm text-zinc-500">Yeni bir hesap oluşturun</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız Soyadınız"
            required
            className="w-full rounded-xl border border-white/6 bg-white/3 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@nexus.com"
            required
            className="w-full rounded-xl border border-white/6 bg-white/3 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Şifre</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/6 bg-white/3 px-4 py-3 pr-11 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Kayıt yapılıyor...
            </>
          ) : (
            'Hesap Oluştur'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Zaten hesabınız var mı?{' '}
        <Link to="/login" className="font-medium text-indigo-400 transition hover:text-indigo-300">
          Giriş Yap
        </Link>
      </p>
    </div>
  )
}
