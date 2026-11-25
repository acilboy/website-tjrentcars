import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-brand-50 border-b border-brand-200/80">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs text-brand-600 overflow-x-auto">
        <Link href="/" className="flex items-center hover:text-brand-950 transition-colors shrink-0">
          <Home className="w-3.5 h-3.5 mr-1 text-gold-700" />
          <span>Beranda</span>
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={item.item} className="flex items-center space-x-2 shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-brand-400" />
              {isLast ? (
                <span className="font-semibold text-brand-950 truncate max-w-xs sm:max-w-md">
                  {item.name}
                </span>
              ) : (
                <Link href={item.item} className="hover:text-brand-950 transition-colors">
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
