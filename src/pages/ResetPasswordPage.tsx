import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { resetPassword } from '../features/auth/authApi'

const schema = z.object({
  email: z.email('Некорректный email'),
})

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [message, setMessage] = useState('')
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const resetMutation = useMutation({
    mutationFn: ({ email }: FormValues) => resetPassword(email),
    onSuccess: () => {
      setMessage('Письмо для сброса пароля отправлено.')
      form.reset()
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : 'Ошибка сброса пароля')
    },
  })

  return (
    <section className="mx-4 mt-8 max-w-md rounded-xl border border-slate-200 bg-white px-4 py-6 sm:mx-auto sm:mt-16 sm:px-6">
      <h1 className="mb-5 text-2xl font-semibold">Восстановление пароля</h1>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => {
          setMessage('')
          resetMutation.mutate(values)
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
        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="min-h-11 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:min-h-0 sm:w-auto"
        >
          {resetMutation.isPending ? 'Отправляем...' : 'Отправить ссылку'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      <div className="mt-4 text-sm">
        <Link className="text-blue-600 hover:underline" to="/auth/login">
          Вернуться ко входу
        </Link>
      </div>
    </section>
  )
}
