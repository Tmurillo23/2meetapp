import Link from "next/link"

export default function SidebarIcon({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="group relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#202c33]"
    >
      {icon}

      {/* Tooltip */}
      <span
        className="
          absolute left-14
          bg-[#202c33] text-sm px-3 py-1 rounded
          opacity-0 group-hover:opacity-100
          transition-opacity whitespace-nowrap
        "
      >
        {label}
      </span>
    </Link>
  )
}
