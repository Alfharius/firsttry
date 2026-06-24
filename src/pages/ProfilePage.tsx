import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  changeCurrentUserPassword,
  fetchCurrentProfile,
  updateCurrentProfile,
} from '../features/profile/profileApi'
import { PageHeader } from '../shared/ui/PageHeader'
import { useAuth } from '../features/auth/useAuth'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Введите имя'),
  email: z.email('Некорректный email'),
  position: z.string().min(2, 'Введите должность'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Минимум 6 символов'),
    newPassword: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string().min(8, 'Минимум 8 символов'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchCurrentProfile,
  })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '', position: '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (!profileQuery.data) return
    profileForm.reset(profileQuery.data)
  }, [profileForm, profileQuery.data])

  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentProfile,
    onSuccess: () => {
      setProfileMessage('Профиль сохранен')
    },
    onError: (error) => {
      setProfileMessage(error instanceof Error ? error.message : 'Ошибка сохранения')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changeCurrentUserPassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordMessage('Пароль успешно изменен')
      passwordForm.reset()
    },
    onError: (error) => {
      setPasswordMessage(error instanceof Error ? error.message : 'Ошибка смены пароля')
    },
  })
  
  const { logout } = useAuth()

  const roleLabel =
    profileQuery.data?.role === 'manager' ? 'Менеджер' : 'Пользователь компании'

  return (
    <section className="space-y-8">
      <PageHeader
        title="Профиль пользователя"
        description="Редактирование основной информации и смена пароля."
      />

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-lg font-semibold">Роль и компания</h3>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Роль:</span> {profileQuery.isLoading ? '...' : roleLabel}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Компания:</span>{' '}
          {profileQuery.isLoading
            ? '...'
            : profileQuery.data?.company?.name ?? '—'}
        </p>
      </div>

      <form
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        onSubmit={profileForm.handleSubmit((values) => {
          setProfileMessage('')
          updateProfileMutation.mutate(values)
        })}
      >
        <h3 className="text-lg font-semibold">Основная информация</h3>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="ФИО"
          {...profileForm.register('fullName')}
        />
        {profileForm.formState.errors.fullName && (
          <p className="text-xs text-rose-600">{profileForm.formState.errors.fullName.message}</p>
        )}
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Email"
          {...profileForm.register('email')}
        />
        {profileForm.formState.errors.email && (
          <p className="text-xs text-rose-600">{profileForm.formState.errors.email.message}</p>
        )}
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Должность"
          {...profileForm.register('position')}
        />
        {profileForm.formState.errors.position && (
          <p className="text-xs text-rose-600">{profileForm.formState.errors.position.message}</p>
        )}
        <button
          type="submit"
          disabled={updateProfileMutation.isPending || profileQuery.isLoading}
          className="w-full min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-fit"
        >
          {updateProfileMutation.isPending ? 'Сохраняем...' : 'Сохранить профиль'}
        </button>
        {profileMessage && <p className="text-sm text-slate-600">{profileMessage}</p>}
      </form>

      <form
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        onSubmit={passwordForm.handleSubmit((values) => {
          setPasswordMessage('')
          passwordMutation.mutate({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          })
        })}
      >
        <h3 className="text-lg font-semibold">Смена пароля</h3>
        <input
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Текущий пароль"
          {...passwordForm.register('currentPassword')}
        />
        {passwordForm.formState.errors.currentPassword && (
          <p className="text-xs text-rose-600">
            {passwordForm.formState.errors.currentPassword.message}
          </p>
        )}
        <input
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Новый пароль"
          {...passwordForm.register('newPassword')}
        />
        {passwordForm.formState.errors.newPassword && (
          <p className="text-xs text-rose-600">{passwordForm.formState.errors.newPassword.message}</p>
        )}
        <input
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Подтверждение нового пароля"
          {...passwordForm.register('confirmPassword')}
        />
        {passwordForm.formState.errors.confirmPassword && (
          <p className="text-xs text-rose-600">
            {passwordForm.formState.errors.confirmPassword.message}
          </p>
        )}
        <button
          type="submit"
          disabled={passwordMutation.isPending}
          className="w-full min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white sm:w-fit"
        >
          {passwordMutation.isPending ? 'Меняем...' : 'Изменить пароль'}
        </button>
        {passwordMessage && <p className="text-sm text-slate-600">{passwordMessage}</p>}
      </form>

      <form
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

        <h3 className="text-lg font-semibold">Выход из аккаунта</h3>
        <button
          type="button"
          onClick={() => void logout()}
          className="w-full min-h-11 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white sm:w-fit"
        >
          Выйти
        </button>
      </form>
    </section>
  )
}
