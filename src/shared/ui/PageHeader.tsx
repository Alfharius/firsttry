interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
    </div>
  )
}
