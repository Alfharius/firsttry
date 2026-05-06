import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { signIn } from '../features/auth/authApi'

const schema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: FormValues) => signIn(email, password),
    onSuccess: () => navigate('/current'),
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : 'Ошибка входа')
    },
  })

  return (
    <section className="mx-auto mt-16 max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="mb-5 text-2xl font-semibold">Вход</h1>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => {
          setMessage('')
          loginMutation.mutate(values)
        })}
      >
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Email"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-rose-600">{form.formState.errors.email.message}</p>
        )}
        <input
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Пароль"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-rose-600">{form.formState.errors.password.message}</p>
        )}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {loginMutation.isPending ? 'Входим...' : 'Войти'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      <div className="mt-4 flex gap-3 text-sm">
        <Link className="text-blue-600 hover:underline" to="/auth/register">
          Регистрация
        </Link>
        <Link className="text-blue-600 hover:underline" to="/auth/reset-password">
          Забыли пароль?
        </Link>
      </div>
    </section>
  )
}
