"use client";

import "@/lib/amplify";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { getUrl, list, uploadData } from "aws-amplify/storage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const ROOTS = ["Courses", "lectures", "projects", "events"];
const REGION = process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1";
const tools = [
  ["Usage dashboard", `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#home:dashboards/S3`],
  ["Audit log", `https://us-east-1.console.aws.amazon.com/s3/buckets/aws-cloudtrail-logs-937836105755-b0d7852b?region=us-east-1&prefix=AWSLogs/937836105755/CloudTrail/us-east-1/2026/10/26/&showversions=false`],
];

type Media = { path: string; name: string; size: number };
const label = (p: string) => p.split("/").filter(Boolean).pop() ?? p;

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [isFaculty, setIsFaculty] = useState(false);
  const [checking, setChecking] = useState(true);
  const [path, setPath] = useState("Courses/");
  const [folders, setFolders] = useState<string[]>([]);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState<{ name: string; url: string } | null>(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<number | null>(null);

  const loadItems = useCallback(async (p: string) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await list({ path: p, options: { listAll: true, subpathStrategy: { strategy: "exclude" } } });
      setFolders(res.excludedSubpaths ?? []);
      setItems(
        res.items
          .filter((i) => !i.path.endsWith("/"))
          .map((i) => ({ path: i.path, name: label(i.path), size: i.size ?? 0 }))
      );
    } catch {
      setFolders([]);
      setItems([]);
      setMessage("Videos could not be loaded. Check that the identity pool is set up and your group's role has S3 read access, then sign in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = (await fetchAuthSession()).tokens?.idToken;
        if (!token) return window.location.replace("/login");
        const groups = (token.payload["cognito:groups"] as string[] | undefined) ?? [];
        setEmail(String(token.payload.email ?? token.payload.username ?? "User"));
        setIsFaculty(groups.includes("Faculty"));
        setChecking(false);
      } catch {
        window.location.replace("/login");
      }
    })();
  }, []);

  useEffect(() => {
    if (!checking) loadItems(path);
  }, [checking, path, loadItems]);

  async function play(item: Media) {
    try {
      const { url } = await getUrl({ path: item.path, options: { expiresIn: 3600 } });
      setPlaying({ name: item.name, url: url.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setMessage("This video could not be opened. Your role may not have read access.");
    }
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProgress(0);
    setMessage("");
    try {
      await uploadData({
        path: `${path}${file.name}`,
        data: file,
        options: { contentType: file.type, onProgress: ({ transferredBytes, totalBytes }) => setProgress(Math.round((transferredBytes / (totalBytes ?? file.size)) * 100)) },
      }).result;
      setMessage(`${file.name} uploaded to ${path}`);
      await loadItems(path);
    } catch {
      setMessage("Upload failed. Check that your Faculty role allows uploads and the bucket CORS rule includes this site.");
    } finally {
      setProgress(null);
    }
  }

  async function logout() {
    await signOut();
    window.location.replace("/login");
  }

  const parts = path.split("/").filter(Boolean);

  if (checking) return <main className="grid min-h-screen place-items-center text-ink/70">Checking your session...</main>;

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/" className="font-display text-2xl font-semibold text-pine-deep">CampusStream</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:block text-ink/70">{email}</span>
            <span className={`rounded-full px-3 py-1 font-medium ${isFaculty ? "bg-signal/30 text-pine-deep" : "bg-mist text-pine-deep"}`}>{isFaculty ? "Faculty" : "Student"}</span>
            <button onClick={logout} className="rounded-lg border border-line px-3 py-1.5 hover:border-pine">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-3xl font-semibold text-pine-deep">Media library</h1>

        {playing && (
          <section className="mt-6" aria-label="Video player">
            <video key={playing.url} src={playing.url} controls autoPlay className="aspect-video w-full rounded-xl bg-black" />
            <div className="mt-2 flex items-center justify-between">
              <p className="font-medium">{playing.name}</p>
              <button onClick={() => setPlaying(null)} className="text-sm text-pine hover:underline">Close player</button>
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist">
          {ROOTS.map((r) => (
            <button key={r} role="tab" aria-selected={parts[0] === r} onClick={() => { setPath(`${r}/`); setPlaying(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${parts[0] === r ? "bg-pine text-white" : "border border-line bg-white hover:border-pine"}`}>{r}</button>
          ))}
          {isFaculty && (
            <label className="ml-auto cursor-pointer rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-ink hover:brightness-95">
              {progress === null ? "Upload here" : `Uploading ${progress}%`}
              <input type="file" accept="video/*" onChange={upload} disabled={progress !== null} className="sr-only" />
            </label>
          )}
        </div>

        <nav aria-label="Folder path" className="mt-4 flex flex-wrap items-center gap-1 text-sm text-ink/70">
          {parts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              <button onClick={() => setPath(parts.slice(0, i + 1).join("/") + "/")} className="hover:text-pine hover:underline">{part}</button>
            </span>
          ))}
        </nav>

        {progress !== null && <div className="mt-3 h-1.5 overflow-hidden rounded bg-mist"><div className="h-full bg-pine transition-all" style={{ width: `${progress}%` }} /></div>}
        {message && <p role="status" className="mt-4 rounded-lg border border-line bg-white p-3 text-sm">{message}</p>}

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && [0, 1, 2].map((i) => <li key={i} className="h-28 animate-pulse rounded-xl bg-mist" />)}
          {!loading && folders.map((f) => (
            <li key={f}>
              <button onClick={() => setPath(f)} className="flex h-full w-full flex-col justify-between rounded-xl border border-line bg-mist/60 p-5 text-left hover:border-pine">
                <span className="font-medium">{label(f)}</span>
                <span className="mt-4 text-sm font-medium text-pine">Open folder</span>
              </button>
            </li>
          ))}
          {!loading && items.map((item) => (
            <li key={item.path} className="flex flex-col justify-between rounded-xl border border-line bg-white p-5">
              <div>
                <p className="break-words font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-ink/60">{(item.size / 1048576).toFixed(1)} MB</p>
              </div>
              <button onClick={() => play(item)} className="mt-4 self-start rounded-lg bg-pine px-4 py-2 text-sm font-medium text-white hover:bg-pine-deep">Play video</button>
            </li>
          ))}
        </ul>
        {!loading && items.length === 0 && folders.length === 0 && !message && (
          <p className="mt-8 text-ink/70">Nothing in {path} yet. {isFaculty ? "Use Upload here to add a video." : "Faculty will add recordings here."}</p>
        )}

        {isFaculty && (
          <section className="mt-12 border-t border-line pt-6">
            <h2 className="font-display text-xl font-semibold">Faculty tools</h2>
            <p className="mt-1 text-sm text-ink/70">These open the AWS console in a new tab.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {tools.map(([name, href]) => (
                <a key={name} href={href} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium hover:border-pine">{name}</a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}