import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-zinc-900">404</h1>
      <p className="mt-4 text-lg text-zinc-600">Page not found</p>
      <Link href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Go Home
      </Link>
    </div>
  );
}
