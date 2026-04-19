import Link from "next/link";

export default function AdminIndex() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-[42px] leading-tight tracking-tight text-ink">
        Admin
      </h1>
      <p className="max-w-[60ch] font-sans text-[16px] leading-[1.6] text-ink-soft">
        Edit the family handbook, review what parents are asking, and spot gaps
        where the chat is coming up short.
      </p>
      <nav className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/handbook"
          className="group rounded-md border border-paper-edge bg-cream p-6 transition-colors hover:border-clay"
        >
          <h2 className="font-display text-[22px] text-ink group-hover:text-clay">
            Handbook
          </h2>
          <p className="mt-2 font-sans text-[14px] text-ink-soft">
            Browse and edit the sections the chat draws from.
          </p>
        </Link>
        <div
          aria-disabled
          className="rounded-md border border-paper-edge/60 bg-paper-deep p-6 opacity-60"
        >
          <h2 className="font-display text-[22px] text-ink-mute">Questions</h2>
          <p className="mt-2 font-sans text-[14px] text-ink-mute">
            What parents are asking. <em>Coming next.</em>
          </p>
        </div>
      </nav>
    </div>
  );
}
