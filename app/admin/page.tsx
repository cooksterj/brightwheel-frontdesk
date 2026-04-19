import Link from "next/link";

const cards: Array<{
  href: string;
  title: string;
  description: string;
}> = [
  {
    href: "/admin/handbook",
    title: "Handbook",
    description: "Browse and edit the sections the chat draws from.",
  },
  {
    href: "/admin/questions",
    title: "Questions",
    description:
      "Every question parents have asked, with confidence, intent, and which sections were cited.",
  },
  {
    href: "/admin/gaps",
    title: "Knowledge gaps",
    description:
      "Clusters of questions the chat struggled with, with drafted handbook sections you can merge.",
  },
];

export default function AdminIndex() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-[42px] leading-tight tracking-tight text-ink">
        Admin
      </h1>
      <p className="max-w-[60ch] font-sans text-[16px] leading-[1.6] text-ink-soft">
        Edit the family handbook, review what parents are asking, and close the
        gaps the chat can't cover yet. Every change goes live on the next
        parent question.
      </p>
      <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-md border border-paper-edge bg-cream p-6 transition-colors hover:border-clay"
          >
            <h2 className="font-display text-[22px] text-ink group-hover:text-clay">
              {c.title}
            </h2>
            <p className="mt-2 font-sans text-[14px] text-ink-soft">
              {c.description}
            </p>
          </Link>
        ))}
      </nav>
    </div>
  );
}
