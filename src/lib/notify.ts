import type { Booking } from "./supabase";

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

export async function sendBookingNotification(
  booking: Booking,
  status: "approved" | "rejected"
): Promise<void> {
  if (!booking.guest_email) return;

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return;

  const balance = Number(booking.balance ?? booking.total_amount - 1000);

  await fetch(EMAILJS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: booking.guest_email,
        to_name: booking.guest_name,
        booking_id: booking.id.slice(0, 8).toUpperCase(),
        room_name: booking.rooms?.name ?? `Room #${booking.room_id}`,
        check_in: booking.check_in,
        check_out: booking.check_out,
        status: status === "approved" ? "Approved ✓" : "Rejected ✗",
        status_message:
          status === "approved"
            ? `Your reservation has been confirmed! ${
                balance > 0
                  ? `Please prepare ₱${balance.toLocaleString()} balance due upon check-in.`
                  : balance < 0
                  ? `You will receive a ₱${Math.abs(balance).toLocaleString()} refund from the owner.`
                  : "Your payment is fully settled."
              }`
            : "Unfortunately your booking was not approved. Please contact us for more details or to rebook.",
        total_amount: `₱${Number(booking.total_amount).toLocaleString()}`,
        reservation_fee: `₱${Number(booking.reservation_fee ?? 1000).toLocaleString()}`,
        balance_due:
          balance < 0
            ? `-₱${Math.abs(balance).toLocaleString()} (refund)`
            : `₱${Math.max(0, balance).toLocaleString()}`,
      },
    }),
  });
}