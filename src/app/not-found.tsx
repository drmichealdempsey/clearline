import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-3 font-display text-3xl tracking-tight">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        The page may have moved, or you may not have access to it.
      </p>
      <Link href="/" className="btn-secondary mt-8">
        Back to home
      </Link>
    </div>
  );
}
