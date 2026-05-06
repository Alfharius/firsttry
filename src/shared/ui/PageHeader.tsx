interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="mb-6 text-2xl font-semibold text-slate-900">
      {title}
    </div>
  )
}
