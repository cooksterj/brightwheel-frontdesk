import Link from "next/link";

export default function AdminIndex() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-[42px] leading-tight tracking-tight text-ink">
        Admin
      </h1>
      <p className="max-w-[60ch] font-sans text-[16px] leading-[1.6] text-ink-soft">
        Edit the family handbook and close gaps the chat can't cover yet. Every
        change goes live on the next parent question.
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
        <Link
          href="/admin/gaps"
          className="group rounded-md border border-paper-edge bg-cream p-6 transition-colors hover:border-clay"
        >
          <h2 className="font-display text-[22px] text-ink group-hover:text-clay">
            Knowledge gaps
          </h2>
          <p className="mt-2 font-sans text-[14px] text-ink-soft">
            Clusters of questions the chat struggled with — and drafted
            handbook sections you can merge.
          </p>
        </Link>
      </nav>
    </div>
  );
}
