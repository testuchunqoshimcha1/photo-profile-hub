import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, LogOut, Trash2, Upload } from "lucide-react";
import { fileToDataUrl, useAuth, type Photo } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Mening hisobim — Fotoxona" },
      { name: "description", content: "Avatar, parol va rasmlaringizni boshqaring." },
      { property: "og:title", content: "Mening hisobim — Fotoxona" },
      { property: "og:description", content: "Avatar, parol va rasmlaringizni boshqaring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

function Account() {
  const a = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (a.ready && !a.user) nav({ to: "/" }); }, [a.ready, a.user, nav]);
  if (!a.user) return null;
  const u = a.user;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <span className="font-display text-2xl text-primary">Fotoxona</span>
        <Button variant="ghost" onClick={a.logout}><LogOut className="size-4" /> Chiqish</Button>
      </header>
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <AvatarCard />
          <PasswordCard />
        </aside>
        <section className="space-y-8">
          <UploadCard />
          <div>
            <h2 className="mb-4 text-3xl">Rasmlarim <span className="text-muted-foreground">({u.photos.length})</span></h2>
            {u.photos.length === 0 ? (
              <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Hali rasm yo'q. Birinchi rasmingizni yuklang!</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {u.photos.map((p) => <PhotoCard key={p.id} photo={p} />)}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AvatarCard() {
  const { user, setAvatar } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  if (!user) return null;
  return (
    <div className="rounded-2xl bg-card p-6 text-center shadow-soft">
      <button onClick={() => ref.current?.click()} className="group relative mx-auto block size-28 overflow-hidden rounded-full bg-accent" aria-label="Avatarni o'zgartirish">
        {user.avatar ? <img src={user.avatar} alt="Avatar" className="size-full object-cover" />
          : <span className="font-display text-4xl text-accent-foreground">{user.name[0]?.toUpperCase()}</span>}
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-background opacity-0 transition group-hover:opacity-100"><Camera /></span>
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setAvatar(await fileToDataUrl(f)); toast.success("Avatar yangilandi");
      }} />
      <h3 className="mt-4 text-2xl">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
    </div>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [err, setErr] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = changePassword(cur, next); setErr(r);
    if (!r) { toast.success("Parol almashtirildi"); setCur(""); setNext(""); }
  };
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
      <h3 className="text-xl">Parolni almashtirish</h3>
      <div className="space-y-2"><Label htmlFor="cur">Joriy parol</Label><Input id="cur" type="password" required value={cur} onChange={(e) => setCur(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="new">Yangi parol</Label><Input id="new" type="password" required value={next} onChange={(e) => setNext(e.target.value)} /></div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" variant="secondary" className="w-full">Saqlash</Button>
    </form>
  );
}

function UploadCard() {
  const { addPhoto } = useAuth();
  const [src, setSrc] = useState<string | null>(null); const [caption, setCaption] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-5 rounded-2xl bg-card p-6 shadow-soft sm:grid-cols-[200px_1fr]">
      <button onClick={() => ref.current?.click()} className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted text-muted-foreground">
        {src ? <img src={src} alt="Tanlangan rasm" className="size-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-sm"><Upload /> Rasm tanlash</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setSrc(await fileToDataUrl(f)); }} />
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl">Yangi rasm yuklash</h2>
        <Textarea placeholder="Rasm uchun izoh yozing..." value={caption} onChange={(e) => setCaption(e.target.value)} className="flex-1" />
        <Button disabled={!src} onClick={() => { if (!src) return; addPhoto(src, caption); setSrc(null); setCaption(""); toast.success("Rasm yuklandi"); }}>Yuklash</Button>
      </div>
    </div>
  );
}

function PhotoCard({ photo }: { photo: Photo }) {
  const { updateCaption, deletePhoto } = useAuth();
  const [editing, setEditing] = useState(false); const [text, setText] = useState(photo.caption);
  return (
    <figure className="overflow-hidden rounded-2xl bg-card shadow-soft">
      <img src={photo.src} alt={photo.caption || "Rasm"} className="aspect-square w-full object-cover" />
      <figcaption className="space-y-2 p-4">
        {editing ? (
          <>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { updateCaption(photo.id, text); setEditing(false); }}>Saqlash</Button>
              <Button size="sm" variant="ghost" onClick={() => { setText(photo.caption); setEditing(false); }}>Bekor qilish</Button>
            </div>
          </>
        ) : (
          <>
            <p className={photo.caption ? "" : "italic text-muted-foreground"}>{photo.caption || "Izoh yo'q"}</p>
            <div className="flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Izohni tahrirlash</Button>
              <Button size="icon" variant="ghost" aria-label="O'chirish" onClick={() => deletePhoto(photo.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </>
        )}
      </figcaption>
    </figure>
  );
}
