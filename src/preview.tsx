import { createRoot } from 'react-dom/client';
import { useRef, useState } from 'react';
import { Button } from './components/Button/Button';
import { Modal, type ModalProps } from './components/Modal/Modal';
import './preview.css';

const Plus = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg>
);
const Arrow = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
);

const variants = ['primary', 'secondary', 'ghost'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

type Variant = NonNullable<ModalProps['variant']>;
type Size = NonNullable<ModalProps['size']>;
type Active =
  | { kind: 'matrix'; variant: Variant; size: Size }
  | { kind: 'busy'; variant: Variant }
  | { kind: 'long' }
  | { kind: 'stack' }
  | { kind: 'confirm' }
  | null;

const modalVariants = ['primary', 'secondary', 'tertiary'] as const;

function ModalDemo() {
  const [active, setActive] = useState<Active>(null);
  const [stacked, setStacked] = useState(false);
  const [busy, setBusy] = useState(true);
  const close = () => { setActive(null); setStacked(false); setBusy(true); };
  const matrix = active?.kind === 'matrix' ? active : null;
  const busyDemo = active?.kind === 'busy' ? active : null;
  const nameRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <h2 className="page-title">Modal</h2>
      <p className="lead">Open each one, then try Tab, Shift+Tab, Escape, and clicking the scrim.</p>

      <h2>Variants × sizes</h2>
      {modalVariants.map((v) => (
        <div className="row" key={v}>
          <span className="label">{v}</span>
          {sizes.map((s) => (
            <Button key={s} variant="secondary" size="sm" onClick={() => setActive({ kind: 'matrix', variant: v, size: s })}>
              {s} modal
            </Button>
          ))}
        </div>
      ))}

      <h2>Busy (close, Escape and scrim disabled)</h2>
      <div className="row">
        {modalVariants.map((v) => (
          <Button key={v} variant="secondary" size="sm" onClick={() => { setBusy(true); setActive({ kind: 'busy', variant: v }); }}>
            {v} busy
          </Button>
        ))}
      </div>

      <h2>Scrolling, stacking, confirmation</h2>
      <div className="row">
        <Button variant="secondary" size="sm" onClick={() => setActive({ kind: 'confirm' })}>Confirm (alertdialog)</Button>
        <Button variant="secondary" size="sm" onClick={() => setActive({ kind: 'long' })}>Long content</Button>
        <Button variant="secondary" size="sm" onClick={() => setActive({ kind: 'stack' })}>Stacked modals</Button>
      </div>

      {matrix && (
        <Modal
          open
          onClose={close}
          variant={matrix.variant}
          size={matrix.size}
          title={`${matrix.variant} · ${matrix.size}`}
          description="Composable: anything goes in the body."
          initialFocusRef={nameRef}
          footer={
            <>
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button onClick={close}>Save</Button>
            </>
          }
        >
          <label>
            Name <input ref={nameRef} defaultValue="Focus starts here" />
          </label>
        </Modal>
      )}

      {busyDemo && (
        <Modal
          open
          onClose={close}
          variant={busyDemo.variant}
          busy={busy}
          title={`${busyDemo.variant} · ${busy ? 'busy' : 'idle'}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setBusy((b) => !b)}>{busy ? 'Finish work' : 'Start work'}</Button>
              <Button loading={busy} onClick={close}>{busy ? 'Saving…' : 'Done'}</Button>
            </>
          }
        >
          <p>While busy, the close button is disabled and Escape and scrim clicks do nothing.</p>
        </Modal>
      )}

      <Modal
        open={active?.kind === 'confirm'}
        onClose={close}
        role="alertdialog"
        variant="tertiary"
        size="sm"
        title="Discard changes?"
        description="Your edits will be lost. This cannot be undone."
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button variant="ghost" ref={cancelRef} onClick={close}>Keep editing</Button>
            <Button onClick={close}>Discard</Button>
          </>
        }
      />

      <Modal
        open={active?.kind === 'long'}
        onClose={close}
        title="Long content"
        footer={<Button onClick={close}>Got it</Button>}
      >
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i}>Paragraph {i + 1}. The header and footer stay pinned while only this body scrolls.</p>
        ))}
      </Modal>

      <Modal
        open={active?.kind === 'stack'}
        onClose={close}
        variant="secondary"
        title="First modal"
        footer={<Button onClick={() => setStacked(true)}>Open second modal</Button>}
      >
        <p>Escape closes only the topmost modal. Focus returns to the previous one.</p>
      </Modal>
      <Modal
        open={active?.kind === 'stack' && stacked}
        onClose={() => setStacked(false)}
        variant="tertiary"
        size="sm"
        title="Second modal"
        footer={<Button onClick={() => setStacked(false)}>Close this one</Button>}
      >
        <p>Stacked above the first.</p>
      </Modal>
    </>
  );
}

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

      <hr />
      <ModalDemo />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Demo />);
