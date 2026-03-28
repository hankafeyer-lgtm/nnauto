import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
      >
        Go home
      </Link>
    </div>
  );
}
