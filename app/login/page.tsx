import Link from "next/link";

const portals = [
  ["/login/student", "Student", "Watch lectures, project demos and events."],
  ["/login/faculty", "Faculty", "Upload recordings and open the usage and audit dashboards."],
];

export default function ChoosePortal() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <Link href="/" className="font-display text-2xl font-semibold text-pine-deep">CampusStream</Link>
      <h1 className="mt-8 font-display text-4xl font-semibold text-pine-deep">Who is signing in?</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {portals.map(([href, name, text]) => (
          <Link key={href} href={href} className="rounded-xl border border-line bg-white p-6 hover:border-pine">
            <p className="font-display text-2xl font-semibold text-pine-deep">{name}</p>
            <p className="mt-2 leading-7 text-ink/75">{text}</p>
            <p className="mt-4 text-sm font-medium text-pine">Sign in or create an account</p>
          </Link>
        ))}
      </div>
    </main>
  );
}