import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getVisitorId() {
  let id = localStorage.getItem('mla_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('mla_visitor_id', id);
  }
  return id;
}

export default function PageTracker() {
  const { pathname } = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    // Don't inflate analytics with admin dashboard visits
    if (pathname.startsWith('/admin')) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const visitorId = getVisitorId();
    supabase
      .from('page_visits')
      .insert({ page_path: pathname, visitor_id: visitorId })
      .then(({ error }) => {
        if (error) console.debug('Visit log skipped:', error.message);
      });
  }, [pathname]);

  return null;
}