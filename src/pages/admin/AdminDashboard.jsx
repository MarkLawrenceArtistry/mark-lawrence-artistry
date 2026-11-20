import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    visitsToday: 0,
    topPages: [],
    totalSales: 0,
    unpaidValue: 0,
    paidCount: 0,
    unpaidCount: 0,
    bestSellers: [],
    recentOrders: [],
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);

      const [
        { count: totalVisits, data: visitRows },
        { data: commissions },
      ] = await Promise.all([
        supabase
          .from('page_visits')
          .select('page_path, visitor_id, visited_at', { count: 'exact' })
          .order('visited_at', { ascending: false })
          .limit(5000),
        supabase
          .from('commissions')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const visits = visitRows || [];
      const orders = commissions || [];

      // 1. Page Visits Analytics
      const todayStr = new Date().toISOString().slice(0, 10);
      const uniqueSet = new Set();
      const pageCounts = {};
      let visitsToday = 0;

      visits.forEach((v) => {
        uniqueSet.add(v.visitor_id);
        pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
        if (v.visited_at?.slice(0, 10) === todayStr) {
          visitsToday += 1;
        }
      });

      const topPages = Object.entries(pageCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // 2. Sales & Best Sellers Analytics
      let totalSales = 0;
      let unpaidValue = 0;
      let paidCount = 0;
      let unpaidCount = 0;
      const sellerMap = {};

      orders.forEach((order) => {
        const amt = Number(order.total_amount) || 0;

        if (order.payment_status === 'paid') {
          totalSales += amt;
          paidCount += 1;

          // Aggregate Best Sellers from Paid Orders
          if (Array.isArray(order.items) && order.items.length > 0) {
            order.items.forEach((item) => {
              const key = item.title || 'Unknown';
              if (!sellerMap[key]) sellerMap[key] = { name: key, qty: 0, revenue: 0 };
              const q = Number(item.quantity) || 1;
              sellerMap[key].qty += q;
              sellerMap[key].revenue += (Number(item.price) || 0) * q;
            });
          } else {
            const key = order.tag || 'Custom';
            if (!sellerMap[key]) sellerMap[key] = { name: key, qty: 0, revenue: 0 };
            sellerMap[key].qty += 1;
            sellerMap[key].revenue += amt;
          }
        } else if (order.payment_status === 'unpaid') {
          unpaidValue += amt;
          unpaidCount += 1;
        }
      });

      const bestSellers = Object.values(sellerMap)
        .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
        .slice(0, 8);

      setStats({
        totalVisits: totalVisits || visits.length,
        uniqueVisitors: uniqueSet.size,
        visitsToday,
        topPages,
        totalSales,
        unpaidValue,
        paidCount,
        unpaidCount,
        bestSellers,
        recentOrders: orders.slice(0, 6),
      });

      setLoading(false);
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p>Loading analytics...</p>
      </div>
    );
  }

  const statCardStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    borderTop: '4px solid var(--accent-color)',
  };

  const maxSellerQty = stats.bestSellers[0]?.qty || 1;

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <div style={statCardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>TOTAL PAID SALES</div>
          <div style={{ fontFamily: 'Zuume', fontSize: '3.2rem', color: '#16a34a' }}>
            ₱{stats.totalSales.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {stats.paidCount} paid commission(s)
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>UNPAID / PENDING</div>
          <div style={{ fontFamily: 'Zuume', fontSize: '3.2rem', color: '#d97706' }}>
            ₱{stats.unpaidValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {stats.unpaidCount} awaiting GCash
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>TOTAL PAGE VISITS</div>
          <div style={{ fontFamily: 'Zuume', fontSize: '3.2rem', color: 'var(--dark-text)' }}>
            {stats.totalVisits.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {stats.visitsToday} visits today
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>UNIQUE VISITORS</div>
          <div style={{ fontFamily: 'Zuume', fontSize: '3.2rem', color: 'var(--accent-color)' }}>
            {stats.uniqueVisitors.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            Across public pages
          </div>
        </div>
      </div>

      {/* Best Sellers + Top Pages */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <div className="card">
          <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>
            Best Sellers (Most Sold)
          </h2>
          {stats.bestSellers.length === 0 ? (
            <p style={{ color: '#666' }}>
              No paid commissions yet. Mark a commission as Paid to track best sellers!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.bestSellers.map((item, idx) => (
                <div key={item.name}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.92rem',
                      marginBottom: '4px',
                    }}
                  >
                    <span>
                      <strong>#{idx + 1}</strong> {item.name}
                    </span>
                    <span>
                      <strong>{item.qty}</strong> sold • ₱{item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round((item.qty / maxSellerQty) * 100)}%`,
                        height: '100%',
                        background: 'var(--accent-color)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Top Visited Pages</h2>
          {stats.topPages.length === 0 ? (
            <p style={{ color: '#666' }}>No visits recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.topPages.map((p) => (
                <div
                  key={p.path}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                  }}
                >
                  <code>{p.path}</code>
                  <strong>{p.count} views</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <h2 style={{ fontSize: '2rem' }}>Recent Commissions</h2>
          <Link to="/admin/commissions" className="btn-small">
            Manage All
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p style={{ color: '#666' }}>No commissions yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px' }}>Client</th>
                  <th style={{ padding: '10px' }}>Tag</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Payment</th>
                  <th style={{ padding: '10px' }}>Work</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px' }}>{o.client_name}</td>
                    <td style={{ padding: '10px' }}>{o.tag}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                      ₱{Number(o.total_amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`status-pill status-${o.payment_status}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`status-pill status-${o.work_status}`}>
                        {o.work_status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}