import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fotoxona — Kirish yoki ro'yxatdan o'tish" },
      { name: "description", content: "Hisobingizga kiring, avatar qo'ying va rasmlaringizni izohlar bilan saqlang." },
      { property: "og:title", content: "Fotoxona — Kirish" },
      { property: "og:description", content: "Rasmlaringizni izohlar bilan saqlang va boshqaring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, ready, login, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) nav({ to: "/account" });
  }, [ready, user, nav]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(mode === "login" ? login(email, password) : signUp(name, email, password));
  };

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground md:flex">
        <span className="font-display text-2xl">Fotoxona</span>
        <div>
          <h1 className="text-6xl leading-tight">Har bir rasm — o'z hikoyasi bilan.</h1>
          <p className="mt-6 max-w-md text-lg opacity-80">Rasmlaringizni yuklang, ularga izoh yozing va shaxsiy albomingizni yarating.</p>
        </div>
        <span className="text-sm opacity-70">© 2026 Fotoxona</span>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <h2 className="text-4xl">{mode === "login" ? "Xush kelibsiz" : "Hisob yarating"}</h2>
          <div className="flex rounded-full bg-muted p-1 text-sm">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 rounded-full py-2 font-medium transition ${mode === m ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                {m === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            ))}
          </div>
          {mode === "signup" && (
            <div className="space-y-2"><Label htmlFor="name">Ism</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          )}
          <div className="space-y-2"><Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="password">Parol</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" size="lg">{mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}</Button>
        </form>
      </section>
    </main>
  );
}
