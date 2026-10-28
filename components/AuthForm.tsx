"use client";

import "@/lib/amplify";
import { confirmSignIn, confirmSignUp, fetchAuthSession, resendSignUpCode, signIn, signOut, signUp } from "aws-amplify/auth";
import Link from "next/link";
import { useState } from "react";

type Role = "student" | "faculty";
type Mode = "signin" | "signup" | "confirm" | "newPassword";

const copy = {
  student: {
    title: "Student portal",
    blurb: "Watch lectures, project demos and campus events.",
    other: ["/login/faculty", "Are you faculty? Go to the faculty portal"],
    signupNote: "Your account is ready as soon as you verify your email.",
  },
  faculty: {
    title: "Faculty portal",
    blurb: "Upload recordings and open the usage and audit dashboards.",
    other: ["/login/student", "Are you a student? Go to the student portal"],
    signupNote: "After you verify your email, an administrator must approve your faculty access before you can sign in here.",
  },
} as const;

const rule = "At least 8 characters, with upper and lower case letters, a number and a symbol.";

export default function AuthForm({ role }: { role: Role }) {
  const c = copy[role];
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function enter() {
    const session = await fetchAuthSession({ forceRefresh: true });
    const groups = (session.tokens?.idToken?.payload["cognito:groups"] as string[] | undefined) ?? [];
    if (role === "faculty" && !groups.includes("Faculty")) {
      await signOut();
      setMode("signin");
      setError("This account isn't approved for faculty yet. Ask an administrator to add it to the Faculty group, or sign in from the student portal.");
      return;
    }
    window.location.assign("/dashboard");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { isSignedIn, nextStep } = await signIn({ username: email, password });
        if (isSignedIn) await enter();
        else if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") setMode("newPassword");
        else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
          await resendSignUpCode({ username: email });
          setMode("confirm");
          setInfo("Your email isn't verified yet. We sent a new code.");
        } else setError("This account needs an extra step the site doesn't support. Ask an administrator.");
      } else if (mode === "newPassword") {
        const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
        if (isSignedIn) await enter();
      } else if (mode === "signup") {
        const { nextStep } = await signUp({ username: email, password, options: { userAttributes: { email, name } } });
        if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
          setMode("confirm");
          setInfo(`We sent a 6-digit code to ${email}.`);
        } else setMode("signin");
      } else {
        await confirmSignUp({ username: email, confirmationCode: code.trim() });
        setMode("signin");
        setCode("");
        setInfo("Email verified. Sign in with your password.");
      }
    } catch (err) {
      const n = (err as Error).name;
      console.error("Cognito error:", err);
      if (n === "UserAlreadyAuthenticatedException") await enter();
      else if (n === "UserNotConfirmedException") {
        await resendSignUpCode({ username: email }).catch(() => {});
        setMode("confirm");
        setInfo("Your email isn't verified yet. We sent a new code.");
      } else if (n === "NotAuthorizedException" || n === "UserNotFoundException") setError("The email or password is incorrect.");
      else if (n === "UsernameExistsException") setError("An account with this email already exists. Use the Sign in tab.");
      else if (n === "InvalidPasswordException") setError(rule);
      else if (n === "CodeMismatchException") setError("That code is incorrect. Check the latest email.");
      else if (n === "ExpiredCodeException") setError("That code has expired. Select Send a new code.");
      else if (n === "LimitExceededException" || n === "TooManyRequestsException") setError("Too many attempts. Wait a few minutes and try again.");
      else setError(`${n}: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await resendSignUpCode({ username: email });
      setInfo("A new code is on its way.");
    } catch {
      setError("Could not send a new code. Wait a minute and try again.");
    }
  }

  const input = "mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-pine";
  const label = "mt-4 block text-sm font-medium";
  const tab = (m: Mode, text: string) => (
    <button type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(""); setInfo(""); }}
      className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === m ? "bg-white shadow-sm" : "text-ink/60"}`}>{text}</button>
  );

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-pine-deep p-12 text-white md:flex">
        <Link href="/" className="font-display text-2xl font-semibold">CampusStream</Link>
        <div>
          <p className="max-w-sm font-display text-4xl font-semibold leading-tight">{c.title}</p>
          <p className="mt-4 max-w-sm text-white/75">{c.blurb}</p>
        </div>
        <Link href={c.other[0]} className="text-sm text-signal hover:underline">{c.other[1]}</Link>
      </aside>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <Link href="/login" className="text-sm text-pine">All portals</Link>
          <h1 className="mt-3 font-display text-3xl font-semibold text-pine-deep">
            {mode === "confirm" ? "Verify your email" : mode === "newPassword" ? "Choose a new password" : c.title}
          </h1>

          {(mode === "signin" || mode === "signup") && (
            <div role="tablist" className="mt-5 flex gap-1 rounded-lg bg-mist p-1">{tab("signin", "Sign in")}{tab("signup", "Create account")}</div>
          )}

          {mode === "signup" && (
            <>
              <label htmlFor="name" className={label}>Full name</label>
              <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
            </>
          )}
          {(mode === "signin" || mode === "signup") && (
            <>
              <label htmlFor="email" className={label}>Email</label>
              <input id="email" required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
              <label htmlFor="pw" className={label}>Password</label>
              <input id="pw" required type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
              {mode === "signup" && <p className="mt-2 text-xs text-ink/60">{rule}</p>}
            </>
          )}
          {mode === "newPassword" && (
            <>
              <p className="mt-2 text-sm text-ink/70">Your account has a temporary password. Set your own to continue.</p>
              <label htmlFor="np" className={label}>New password</label>
              <input id="np" required type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={input} />
            </>
          )}
          {mode === "confirm" && (
            <>
              <label htmlFor="code" className={label}>Verification code</label>
              <input id="code" required inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className={input} />
              <button type="button" onClick={resend} className="mt-2 text-sm text-pine hover:underline">Send a new code</button>
            </>
          )}

          {mode === "signup" && <p className="mt-4 text-sm text-ink/70">{c.signupNote}</p>}
          {info && <p role="status" className="mt-4 rounded-lg bg-mist p-3 text-sm">{info}</p>}
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          <button disabled={loading} className="mt-6 w-full rounded-lg bg-pine py-3 font-medium text-white hover:bg-pine-deep disabled:opacity-50">
            {loading ? "Please wait..." : { signin: "Sign in", signup: "Create account", confirm: "Verify email", newPassword: "Save password and continue" }[mode]}
          </button>
          <Link href={c.other[0]} className="mt-6 block text-center text-sm text-pine md:hidden">{c.other[1]}</Link>
        </form>
      </section>
    </main>
  );
}