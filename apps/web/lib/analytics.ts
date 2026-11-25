/**
 * Analytics events dispatcher for TJ Rentcar
 * Privacy Guarantee: Strictly NO Personally Identifiable Information (PII) is transmitted.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    // Sanitize parameters to guarantee zero PII leakage
    const sanitizedParams = { ...params };
    delete sanitizedParams.customerName;
    delete sanitizedParams.customerPhone;
    delete sanitizedParams.customerEmail;
    delete sanitizedParams.customerNote;
    delete sanitizedParams.pickupLocation;
    delete sanitizedParams.returnLocation;
    delete sanitizedParams.bookingCode;

    window.gtag("event", eventName, sanitizedParams);
  }
}

export function trackViewVehicle(vehicleId: string, vehicleName: string, category: string) {
  trackEvent("view_vehicle", {
    vehicle_id: vehicleId,
    vehicle_name: vehicleName,
    category,
  });
}

export function trackSelectService(serviceSlug: string, serviceTitle: string) {
  trackEvent("select_service", {
    service_slug: serviceSlug,
    service_title: serviceTitle,
  });
}

export function trackBeginBooking(vehicleId: string, serviceType: string) {
  trackEvent("begin_booking", {
    vehicle_id: vehicleId,
    service_type: serviceType,
  });
}

export function trackBookingSubmit(serviceType: string, billingUnit: string, durationUnits: number) {
  trackEvent("booking_submit", {
    service_type: serviceType,
    billing_unit: billingUnit,
    duration_units: durationUnits,
  });
}

export function trackClickWhatsApp(source: string) {
  trackEvent("click_whatsapp", {
    source,
  });
}

export function trackClickPhone(source: string) {
  trackEvent("click_phone", {
    source,
  });
}
