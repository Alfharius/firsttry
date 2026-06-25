import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useId, useRef, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { fetchCompanies } from '../features/companies/companiesApi'
import { createEvent } from '../features/events/eventsApi'
import { PageHeader } from '../shared/ui/PageHeader'
import { inputClassName } from '../shared/ui/formStyles'
import { Select } from '../shared/ui/Select'
import {
  createDefaultEstimateItems,
  EstimateEditor,
  type EstimateItemDraft,
} from '../shared/ui/EstimateEditor'
import type { EventType } from '../types/domain'

const eventTypes: EventType[] = ['Конференция', 'Мастер-класс', 'Встреча']

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function requiredString(label: string, max = 255) {
  return z
    .string()
    .trim()
    .min(1, `${label}: поле обязательно`)
    .min(2, `${label}: минимум 2 символа`)
    .max(max, `${label}: максимум ${max} символов`)
}

const schema = z
  .object({
    title: requiredString('Название'),
    type: z.enum(['Конференция', 'Мастер-класс', 'Встреча'], {
      error: 'Выберите тип мероприятия',
    }),
    category: requiredString('Категория'),
    organizerName: requiredString('Организатор'),
    location: requiredString('Локация'),
    participantsCount: z
      .number({ error: 'Укажите число участников' })
      .refine((value) => !Number.isNaN(value), 'Укажите число участников')
      .int('Число участников должно быть целым')
      .min(0, 'Минимум 0 участников')
      .max(100_000, 'Слишком большое число участников'),
    startAt: z.string().min(1, 'Укажите дату и время начала'),
    endAt: z.string().min(1, 'Укажите дату и время окончания'),
    estimateNote: z
      .string()
      .trim()
      .max(2000, 'Описание сметы: максимум 2000 символов')
      .optional(),
    companyId: z
      .string()
      .trim()
      .min(1, 'Выберите компанию')
      .regex(/^\d+$/, 'Выберите компанию из списка'),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt)
    const end = new Date(data.endAt)

    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: 'custom',
        message: 'Некорректная дата начала',
        path: ['startAt'],
      })
    }

    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: 'custom',
        message: 'Некорректная дата окончания',
        path: ['endAt'],
      })
    }

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end <= start
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Дата окончания должна быть позже даты начала',
        path: ['endAt'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

function FormField({
  label,
  className,
  error,
  children,
}: {
  label: string
  className?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className={`grid gap-1 ${className ?? ''}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Допустимы только файлы изображений (JPG, PNG, WEBP и др.)'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Размер файла не должен превышать 5 МБ'
  }
  return null
}

function validateEstimateItems(items: EstimateItemDraft[]): string | null {
  if (items.length === 0) {
    return 'Добавьте хотя бы одну позицию сметы'
  }
  if (items[0].name.trim() !== 'Организация мероприятия') {
    return 'Первая позиция сметы — «Организация мероприятия»'
  }
  for (const item of items) {
    if (!item.locked && !item.name.trim()) {
      return 'Укажите название для каждой дополнительной позиции'
    }
  }
  return null
}

export function CreateEventPage() {
  const navigate = useNavigate()
  const imageInputId = useId()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [estimateItems, setEstimateItems] = useState<EstimateItemDraft[]>(createDefaultEstimateItems)

  function handleImageSelect(file: File | null) {
    if (file) {
      const fileError = validateImageFile(file)
      if (fileError) {
        setImageError(fileError)
        return
      }
    }
    setImageError('')
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setImageFile(file)
  }

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      type: 'Конференция',
      category: '',
      organizerName: '',
      location: '',
      participantsCount: 0,
      startAt: '',
      endAt: '',
      estimateNote: '',
      companyId: '',
    },
  })

  const {
    register,
    formState: { errors },
  } = form

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!imageFile) {
        throw new Error('Загрузите изображение мероприятия')
      }

      const imageValidationError = validateImageFile(imageFile)
      if (imageValidationError) {
        throw new Error(imageValidationError)
      }

      const estimateError = validateEstimateItems(estimateItems)
      if (estimateError) {
        throw new Error(estimateError)
      }

      const payloadItems = estimateItems.map((item) => ({
        name: item.name.trim(),
        netto: item.netto,
      }))

      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('type', values.type)
      formData.append('category', values.category)
      formData.append('organizerName', values.organizerName)
      formData.append('location', values.location)
      formData.append('participantsCount', String(values.participantsCount))
      formData.append('startAt', new Date(values.startAt).toISOString())
      formData.append('endAt', new Date(values.endAt).toISOString())
      if (values.estimateNote) {
        formData.append('estimateNote', values.estimateNote)
      }
      formData.append('estimateItems', JSON.stringify(payloadItems))
      formData.append('companyId', values.companyId)
      formData.append('image', imageFile)

      return createEvent(formData)
    },
    onSuccess: () => {
      navigate('/upcoming')
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : 'Ошибка создания')
    },
  })

  return (
    <section className="space-y-6">
      <PageHeader title="Добавить мероприятие" />

      <form
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        onSubmit={form.handleSubmit((values) => {
          setMessage('')
          if (!imageFile) {
            setImageError('Загрузите изображение мероприятия')
            return
          }
          setImageError('')
          createMutation.mutate(values)
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Название" className="md:col-span-2" error={errors.title?.message}>
            <input
              className={inputClassName}
              placeholder="Введите название мероприятия"
              {...register('title')}
            />
          </FormField>

          <FormField label="Тип мероприятия" error={errors.type?.message}>
            <Select {...register('type')}>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Категория" error={errors.category?.message}>
            <input
              className={inputClassName}
              placeholder="Например: ИТ, HR, Дизайн"
              {...register('category')}
            />
          </FormField>

          <FormField label="Организатор" error={errors.organizerName?.message}>
            <input
              className={inputClassName}
              placeholder="Название организатора или площадки"
              {...register('organizerName')}
            />
          </FormField>

          <FormField label="Локация" error={errors.location?.message}>
            <input
              className={inputClassName}
              placeholder="Адрес или название площадки"
              {...register('location')}
            />
          </FormField>

          <FormField label="Число участников" error={errors.participantsCount?.message}>
            <input
              type="number"
              min={0}
              step={1}
              className={inputClassName}
              placeholder="0"
              {...register('participantsCount', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Компания" error={errors.companyId?.message}>
            <Select {...register('companyId')} disabled={companiesQuery.isLoading}>
              <option value="">Выберите компанию</option>
              {companiesQuery.data?.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Дата и время начала" error={errors.startAt?.message}>
            <input
              type="datetime-local"
              className={inputClassName}
              {...register('startAt')}
            />
          </FormField>

          <FormField label="Дата и время окончания" error={errors.endAt?.message}>
            <input
              type="datetime-local"
              className={inputClassName}
              {...register('endAt')}
            />
          </FormField>

          <EstimateEditor items={estimateItems} onChange={setEstimateItems} />

          <FormField label="Описание сметы" className="md:col-span-2" error={errors.estimateNote?.message}>
            <textarea
              className={inputClassName}
              placeholder="Главная сцена, брендинг, кофе-брейки..."
              rows={3}
              {...register('estimateNote')}
            />
          </FormField>
        </div>

        <FormField label="Изображение мероприятия" error={imageError || undefined}>
          <input
            ref={imageInputRef}
            id={imageInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              handleImageSelect(event.target.files?.[0] ?? null)
            }}
          />
          <label
            htmlFor={imageInputId}
            className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 transition hover:border-blue-400 hover:bg-slate-50"
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Превью мероприятия"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                  <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-800 opacity-0 transition group-hover:opacity-100">
                    Заменить изображение
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 text-center text-slate-500">
                <span className="text-3xl font-light leading-none text-slate-400">+</span>
                <span className="text-sm">Нажмите, чтобы загрузить изображение</span>
                <span className="text-xs text-slate-400">JPG, PNG, WEBP до 5 МБ</span>
              </div>
            )}
          </label>
          {imageFile && (
            <button
              type="button"
              className="text-sm text-slate-500 hover:text-rose-600"
              onClick={() => {
                handleImageSelect(null)
                if (imageInputRef.current) imageInputRef.current.value = ''
              }}
            >
              Удалить изображение
            </button>
          )}
        </FormField>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-fit"
        >
          {createMutation.isPending ? 'Создаём...' : 'Создать мероприятие'}
        </button>

        {message && <p className="text-sm text-rose-600">{message}</p>}
      </form>
    </section>
  )
}
