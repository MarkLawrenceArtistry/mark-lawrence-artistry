import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const [{ data: profiles }, { data: commissions }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('commissions').select('client_id, total_amount, payment_status'),
      ]);

      const statsMap = {};
      (commissions || []).forEach((c) => {
        if (!c.client_id) return;
        if (!statsMap[c.client_id]) {
          statsMap[c.client_id] = { orders: 0, paidTotal: 0 };
        }
        statsMap[c.client_id].orders += 1;
        if (c.payment_status === 'paid') {
          statsMap[c.client_id].paidTotal += Number(c.total_amount) || 0;
        }
      });

      const merged = (profiles || []).map((p) => ({
        ...p,
        ordersCount: statsMap[p.id]?.orders || 0,
        paidTotal: statsMap[p.id]?.paidTotal || 0,
      }));

      setUsers(merged);
      setLoading(false);
    };

    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.contact_number?.toLowerCase().includes(q) ||
      u.fb_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', margin: 0 }}>
          Users & Clients ({filtered.length})
        </h2>
        <input
          type="text"
          className="form-control"
          style={{ width: '260px' }}
          placeholder="Search name, email, contact, FB..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#666' }}>No matching users found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Contact #</th>
                <th style={{ padding: '10px' }}>Facebook</th>
                <th style={{ padding: '10px' }}>Orders</th>
                <th style={{ padding: '10px' }}>Paid Spent</th>
                <th style={{ padding: '10px' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>
                    {u.full_name || '—'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span
                      className={`status-pill ${
                        u.role === 'admin' ? 'status-paid' : 'status-in_progress'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>{u.contact_number || '—'}</td>
                  <td style={{ padding: '10px' }}>{u.fb_name || '—'}</td>
                  <td style={{ padding: '10px' }}>{u.ordersCount}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>
                    ₱{u.paidTotal.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.85rem', color: '#666' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}