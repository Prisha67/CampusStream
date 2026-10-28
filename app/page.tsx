import Link from "next/link";

const path = [
  ["Upload", "Faculty add a recording"],
  ["Amazon S3", "Stored in a private bucket"],
  ["CloudFront", "Cached at an edge location near the viewer"],
  ["Your browser", "Plays after Cognito sign-in"],
];
const folders = [
  ["lectures", "Recorded classes, organised by course."],
  ["projects", "Student project demos and presentations."],
  ["events", "Orientation, talks and campus events."],
];
const aws = [
  ["Amazon S3", "Stores every video; no public access."],
  ["Amazon CloudFront", "Serves popular videos from the edge, so the bucket is not hit every time."],
  ["Amazon Cognito", "Sign-in, with Faculty and Students groups."],
  ["AWS IAM", "Least-privilege roles for each group."],
  ["Amazon CloudWatch", "Dashboards for storage, requests and sign-ups."],
  ["AWS CloudTrail", "A record of who changed the bucket, roles or users."],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-2xl font-semibold text-pine-deep">CampusStream</Link>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#how" className="hidden hover:text-pine sm:block">How it works</a>
            <a href="#access" className="hidden hover:text-pine sm:block">Who can do what</a>
            <Link href="/login" className="rounded-lg bg-pine px-4 py-2 font-medium text-white hover:bg-pine-deep">Sign in</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-20 md:pt-28">
        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-pine-deep md:text-7xl">
          Every lecture, one sign-in away.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">
          CampusStream keeps lecture recordings, project demos and event footage in one place. Students watch, faculty upload, and nothing is open to the public.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-lg bg-pine px-6 py-3 font-medium text-white hover:bg-pine-deep">Sign in to watch</Link>
          <a href="#how" className="rounded-lg border border-line bg-white px-6 py-3 font-medium hover:border-pine">See how it works</a>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative rounded-2xl border border-line bg-white p-6 md:p-8">
          <p className="mb-6 font-display text-xl font-semibold">How a video reaches you</p>
          <div className="relative grid gap-6 md:grid-cols-4">
            <div aria-hidden className="absolute left-0 right-0 top-[10px] hidden h-px bg-line md:block">
              <span className="travel-dot absolute -top-[5px] h-3 w-3 rounded-full bg-signal" />
            </div>
            {path.map(([name, note]) => (
              <div key={name} className="relative pt-0 md:pt-8">
                <p className="font-semibold text-pine-deep">{name}</p>
                <p className="mt-1 text-sm leading-6 text-ink/70">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-mist/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl font-semibold text-pine-deep">What you'll find inside</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {folders.map(([name, text]) => (
              <Link href="/login" key={name} className="rounded-xl border border-line bg-white p-6 hover:border-pine">
                <p className="font-mono text-sm text-pine">{name}/</p>
                <p className="mt-3 leading-7 text-ink/75">{text}</p>
                <p className="mt-4 text-sm font-medium text-pine">Sign in to browse</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-pine-deep">Who can do what</h2>
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-mist/60">
              <tr><th className="p-4 font-semibold">Action</th><th className="p-4 font-semibold">Students</th><th className="p-4 font-semibold">Faculty</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[["Browse and watch videos", "Yes", "Yes"], ["Upload videos", "No", "Yes"], ["Open usage and audit dashboards", "No", "Yes"]].map(([a, s, f]) => (
                <tr key={a}><td className="p-4">{a}</td><td className="p-4">{s}</td><td className="p-4 font-medium text-pine">{f}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-pine-deep text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl font-semibold">Built on AWS</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {aws.map(([n, d]) => (
              <div key={n} className="border-t border-white/20 pt-4">
                <dt className="font-semibold text-signal">{n}</dt>
                <dd className="mt-1 text-white/80">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-sm text-ink/60">
        © 2026 CampusStream. Smart Campus Media Hosting, Cloud Architecture Design (BCSE355L).
      </footer>
    </main>
  );
}
