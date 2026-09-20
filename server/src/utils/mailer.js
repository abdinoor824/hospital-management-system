const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"HMS" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Never let an email failure break the actual booking/payment flow
    console.error("Email send failed:", err.message);
  }
}

function sendBookingNotificationToDoctor({ doctorEmail, doctorName, patientName, date, time, reason }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color: #4f46e5;">New Appointment Booking</h2>
      <p>Hi Dr. ${doctorName},</p>
      <p><strong>${patientName}</strong> has booked an appointment with you.</p>
      <table style="width: 100%; margin: 16px 0;">
        <tr><td style="color: #64748b; padding: 4px 0;">Date</td><td>${new Date(date).toLocaleDateString()}</td></tr>
        <tr><td style="color: #64748b; padding: 4px 0;">Time</td><td>${time}</td></tr>
        ${reason ? `<tr><td style="color: #64748b; padding: 4px 0;">Reason</td><td>${reason}</td></tr>` : ""}
      </table>
      <p style="color: #64748b; font-size: 13px;">Log in to your dashboard to confirm or manage this appointment.</p>
    </div>
  `;
  return sendEmail(doctorEmail, "New Appointment Booking", html);
}

function sendAppointmentConfirmedEmail({ patientEmail, patientName, doctorName, date, time }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color: #4f46e5;">Appointment Confirmed</h2>
      <p>Hi ${patientName},</p>
      <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.</p>
      <table style="width: 100%; margin: 16px 0;">
        <tr><td style="color: #64748b; padding: 4px 0;">Date</td><td>${new Date(date).toLocaleDateString()}</td></tr>
        <tr><td style="color: #64748b; padding: 4px 0;">Time</td><td>${time}</td></tr>
      </table>
      <p style="color: #64748b; font-size: 13px;">See you then!</p>
    </div>
  `;
  return sendEmail(patientEmail, "Your Appointment is Confirmed", html);
}

function sendPaymentReceivedEmail({ patientEmail, patientName, amount, method, doctorName }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color: #059669;">Payment Received</h2>
      <p>Hi ${patientName},</p>
      <p>We've received your payment of <strong>KES ${amount}</strong> via <strong>${method}</strong> for your appointment with Dr. ${doctorName}.</p>
      <p style="color: #64748b; font-size: 13px;">Thank you for using HMS.</p>
    </div>
  `;
  return sendEmail(patientEmail, "Payment Received", html);
}

module.exports = { sendEmail, sendBookingNotificationToDoctor, sendAppointmentConfirmedEmail, sendPaymentReceivedEmail };