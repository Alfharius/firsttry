interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}
