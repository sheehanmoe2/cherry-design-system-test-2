import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Button } from './components/Button/Button';
import './preview.css';

const Plus = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg>
);
const Arrow = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
);

const variants = ['primary', 'secondary', 'ghost'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

function Demo() {
  const [saving, setSaving] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  return (
    <main>
      <h1>Button</h1>
      <p className="lead">Tab through the buttons to see the focus ring.</p>

      <h2>Variants × sizes</h2>
      {variants.map((v) => (
        <div className="row" key={v}>
          <span className="label">{v}</span>
          {sizes.map((s) => (
            <Button key={s} variant={v} size={s}>{s} button</Button>
          ))}
        </div>
      ))}

      <h2>Icons</h2>
      <div className="row">
        <Button leftIcon={<Plus />}>Add item</Button>
        <Button variant="secondary" rightIcon={<Arrow />}>Next</Button>
        <Button variant="ghost" leftIcon={<Plus />} rightIcon={<Arrow />}>Both</Button>
        <Button aria-label="Add" leftIcon={<Plus />} />
        <Button variant="secondary" size="lg" aria-label="Next" rightIcon={<Arrow />} />
      </div>

      <h2>Disabled</h2>
      <div className="row">
        {variants.map((v) => <Button key={v} variant={v} disabled>{v}</Button>)}
      </div>

      <h2>Loading (focusable, clicks blocked)</h2>
      <div className="row">
        {variants.map((v) => <Button key={v} variant={v} loading onClick={() => setClicks((c) => c + 1)}>Saving…</Button>)}
        <span className="note">clicks that got through: {clicks}</span>
      </div>
      <div className="row">
        <Button loading={saving} onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 2000); }}>
          {saving ? 'Saving…' : 'Click to save (2s)'}
        </Button>
      </div>

      <h2>Default type="button"</h2>
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="row">
        <Button>Does not submit</Button>
        <Button type="submit" variant="secondary">Submit</Button>
        <span className="note">{submitted ? 'form submitted by Submit' : 'not submitted'}</span>
      </form>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Demo />);
