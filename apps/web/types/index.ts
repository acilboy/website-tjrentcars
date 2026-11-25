export type Role = "SUPER_ADMIN" | "ADMIN";
export type ServiceType = "WITH_DRIVER" | "SELF_DRIVE";
export type BillingUnit = "DAILY" | "WEEKLY" | "MONTHLY";
export type Transmission = "MANUAL" | "AUTOMATIC" | "OTHER";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";
export type PaymentStatus = "NOT_TRACKED" | "UNPAID" | "DP_PAID" | "PAID" | "REFUNDED";
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BlockReason = "MAINTENANCE" | "INTERNAL_USE" | "OTHER";

export interface VehicleImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface VehicleRate {
  id: string;
  serviceType: ServiceType;
  billingUnit: BillingUnit;
  amount: number;
  notes?: string | null;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalPath?: string | null;
  totalVehicles?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year?: number | null;
  category: string;
  transmission?: Transmission | null;
  seats?: number | null;
  doors?: number | null;
  fuelType?: string | null;
  luggageCapacity?: string | null;
  description?: string | null;
  features?: string[];
  primaryImage?: { id: string; url: string; altText?: string | null } | null;
  images?: VehicleImage[];
  rates?: VehicleRate[];
  minRate?: number | null;
  services?: { id: string; title: string; slug: string }[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalPath?: string | null;
  isActive?: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceType: ServiceType;
  billingUnit: BillingUnit;
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  returnLocation?: string | null;
  durationUnits: number;
  estimatedTotal?: number | null;
  priceBreakdown?: string | null;
  customerNote?: string | null;
  adminNote?: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountPaid?: number | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  vehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    category: string;
  };
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  city: string;
  primaryServiceArea: string;
  countryCode: string;
  locale: string;
  timezone: string;
  currency: string;
  siteUrl: string;
  logoUrl: string | null;
  publicAddress: string | null;
  showPublicAddress: boolean;
  publicCoordinates: { lat: number; lng: number } | null;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  businessHours: string | null;
  serviceAreas: string[];
  airportRoutes: string[];
  outOfTownRoutes: string[];
  socialLinks: { platform: string; url: string }[];
  googleBusinessProfileUrl: string | null;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalPath?: string | null;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  category?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  updatedAt?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalPath?: string | null;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  activeVehicles: number;
  totalVehicles: number;
  maintenanceVehicles: number;
  unreadMessages: number;
  recentBookings: any[];
}
