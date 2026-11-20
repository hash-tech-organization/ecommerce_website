'use client';

import Link from 'next/link';
import { useState } from 'react';
import './period-tracker.css';

export function PeriodTracker() {
  const [result, setResult] = useState('');
  return <div className="period-tracker"><form onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const [year, month, day] = String(data.get('date')).split('-').map(Number);
    const next = new Date(year, month - 1, day, 12);
    next.setDate(next.getDate() + Number(data.get('cycle')));
    const end = new Date(next); end.setDate(end.getDate() + Number(data.get('length')));
    setResult(`Your next period is expected between ${next.toDateString()} and ${end.toDateString()}. Stay confident with Veloura.`);
  }}><label htmlFor="period-date">Last Period Start Date:</label><input id="period-date" type="date" name="date" required /><label htmlFor="period-cycle">Average Cycle Length (days):</label><input id="period-cycle" type="number" name="cycle" min="21" max="45" defaultValue="28" required /><label htmlFor="period-length">Average Period Length (days):</label><input id="period-length" type="number" name="length" min="1" max="14" defaultValue="5" required /><button type="submit">Track My Cycle</button><div className="period-result" role="status">{result}</div></form><div className="period-faq"><details><summary>How does Veloura Women Period Tracker help me?</summary><p>Veloura Women Period Tracker helps you predict your next period, track your cycle, and stay prepared with Veloura&apos;s comfortable products.</p></details><details><summary>Is Veloura Women Period Tracker free to use?</summary><p>Yes, it&apos;s a free online tool provided by Veloura to help women in Pakistan stay confident and in control of their cycle.</p></details><details><summary>Where can I buy Veloura products?</summary><p>You can explore and shop our full range of bras, panties, sleepwear, lingerie, stockings, shapewear, and period-friendly wear on <Link href="/collections/all">our website</Link>.</p></details></div></div>;
}
