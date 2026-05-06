import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { signIn, signUp } from '../features/auth/authApi'

const schema = z
  .object({
    fullName: z.string().min(2, 'Введите имя'),
    email: z.email('Некорректный email'),
    password: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string().min(8, 'Минимум 8 символов'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, fullName }: FormValues) => {
      await signUp(email, password, fullName)
      // Try immediate login so account creation is not blocked by confirmation step in UI flow.
      await signIn(email, password)
    },
    onSuccess: () => {
      setMessage('Аккаунт создан. Выполняем вход...')
      form.reset()
      navigate('/current')
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : 'Ошибка регистрации')
    },
  })

  return (
    <section className="mx-auto mt-16 max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="mb-5 text-2xl font-semibold">Регистрация</h1>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => {
          setMessage('')
          registerMutation.mutate(values)
        })}
      >
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="ФИО"
          {...form.register('fullName')}
        />
        {form.formState.errors.fullName && (
          <p className="text-xs text-rose-600">{form.formState.errors.fullName.message}</p>
        )}
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
        <input
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Подтверждение пароля"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-xs text-rose-600">{form.formState.errors.confirmPassword.message}</p>
        )}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {registerMutation.isPending ? 'Создаем...' : 'Создать аккаунт'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      <div className="mt-4 text-sm">
        <Link className="text-blue-600 hover:underline" to="/auth/login">
          Уже есть аккаунт? Войти
        </Link>
      </div>
    </section>
  )
}
