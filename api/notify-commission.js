import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { commissionId } = req.body || {};

  if (!commissionId) {
    return res.status(400).json({ error: 'Missing commissionId' });
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Verify user session
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  // Fetch the commission securely from DB
  const { data: commission, error: commError } = await supabaseAdmin
    .from('commissions')
    .select('*')
    .eq('id', commissionId)
    .single();

  if (commError || !commission) {
    return res.status(404).json({ error: 'Commission not found' });
  }

  // Ensure the caller owns this commission
  if (commission.client_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(200).json({ skipped: true, reason: 'BREVO_API_KEY not configured' });
  }

  const itemsListHtml = (commission.items || [])
    .map(
      (item) =>
        `<li><strong>${item.title}</strong> x${item.quantity} — ₱${Number(
          item.price * item.quantity
        ).toLocaleString()}</li>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #2b2b2b; color: #fff; padding: 20px; border-bottom: 4px solid #ee3154;">
        <h2 style="margin: 0;">New Commission Order (Unpaid)</h2>
        <p style="margin: 5px 0 0; color: #ccc;">Mark Lawrence Artistry</p>
      </div>
      <div style="padding: 20px; background: #f8f9fa; border: 1px solid #e5e7eb;">
        <p><strong>Client Name:</strong> ${commission.client_name}</p>
        <p><strong>Email:</strong> ${commission.client_email}</p>
        <p><strong>Contact #:</strong> ${commission.client_contact}</p>
        <p><strong>Facebook Name/Link:</strong> ${commission.fb_name || 'Not provided'}</p>
        <p><strong>Payment Method:</strong> ${commission.payment_method} (Status: <strong>${commission.payment_status.toUpperCase()}</strong>)</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
        <p><strong>Ordered Items:</strong></p>
        <ul>${itemsListHtml || `<li>${commission.tag}</li>`}</ul>
        <p style="font-size: 18px;"><strong>Total Amount: ₱${Number(
          commission.total_amount
        ).toLocaleString()}</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
        <p><strong>Commission Brief / Notes:</strong></p>
        <p style="white-space: pre-wrap; background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">${
          commission.description || 'No description provided.'
        }</p>
      </div>
    </div>
  `;

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Mark Lawrence Artistry',
          email: process.env.BREVO_SENDER_EMAIL || 'marklawrence.artistry@gmail.com',
        },
        to: [
          {
            email: process.env.ADMIN_EMAIL || 'marklawrence.artistry@gmail.com',
            name: 'Mark Lawrence',
          },
        ],
        replyTo: {
          email: commission.client_email || process.env.ADMIN_EMAIL,
          name: commission.client_name,
        },
        subject: `[New Commission] ₱${Number(commission.total_amount).toLocaleString()} - ${
          commission.client_name
        }`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      return res.status(502).json({ error: 'Brevo error', details: errText });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}