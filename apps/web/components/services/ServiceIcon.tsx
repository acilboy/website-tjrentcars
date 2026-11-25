import {
  UserCheck,
  KeyRound,
  Calendar,
  CalendarDays,
  Building2,
  Plane,
  Compass,
  Car,
} from "lucide-react";

interface ServiceIconProps {
  slug: string;
  className?: string;
}

export function ServiceIcon({ slug, className = "w-6 h-6" }: ServiceIconProps) {
  switch (slug) {
    case "dengan-sopir":
      return <UserCheck className={className} />;
    case "lepas-kunci":
      return <KeyRound className={className} />;
    case "sewa-harian":
      return <Calendar className={className} />;
    case "sewa-mingguan":
      return <CalendarDays className={className} />;
    case "sewa-bulanan":
      return <Building2 className={className} />;
    case "antar-jemput-bandara":
      return <Plane className={className} />;
    case "perjalanan-luar-kota":
      return <Compass className={className} />;
    default:
      return <Car className={className} />;
  }
}
