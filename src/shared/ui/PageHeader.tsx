interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
    </header>
  )
}
