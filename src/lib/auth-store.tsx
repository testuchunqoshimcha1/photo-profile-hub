import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Photo = { id: string; src: string; caption: string; createdAt: number };
export type User = { id: string; name: string; email: string; password: string; avatar?: string; photos: Photo[] };

type Ctx = {
  ready: boolean;
  user: User | null;
  signUp: (name: string, email: string, password: string) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  setAvatar: (src: string) => void;
  changePassword: (current: string, next: string) => string | null;
  addPhoto: (src: string, caption: string) => void;
  updateCaption: (id: string, caption: string) => void;
  deletePhoto: (id: string) => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const USERS = "fotoxona_users";
const SESSION = "fotoxona_session";

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setUsers(JSON.parse(localStorage.getItem(USERS) || "[]"));
      setSessionId(localStorage.getItem(SESSION));
    } catch {}
    setReady(true);
  }, []);

  const save = (next: User[]) => {
    setUsers(next);
    try {
      localStorage.setItem(USERS, JSON.stringify(next));
    } catch {
      alert("Brauzer xotirasi to'ldi. Kichikroq rasm yuklang.");
    }
  };
  const setSession = (id: string | null) => {
    setSessionId(id);
    if (id) localStorage.setItem(SESSION, id);
    else localStorage.removeItem(SESSION);
  };

  const user = users.find((u) => u.id === sessionId) ?? null;
  const patch = (fn: (u: User) => User) => {
    if (!user) return;
    save(users.map((u) => (u.id === user.id ? fn(u) : u)));
  };

  const value: Ctx = {
    ready,
    user,
    signUp: (name, email, password) => {
      const e = email.trim().toLowerCase();
      if (users.some((u) => u.email === e)) return "Bu email bilan hisob allaqachon mavjud";
      if (password.length < 6) return "Parol kamida 6 belgidan iborat bo'lsin";
      const u: User = { id: crypto.randomUUID(), name: name.trim(), email: e, password, photos: [] };
      save([...users, u]);
      setSession(u.id);
      return null;
    },
    login: (email, password) => {
      const u = users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
      if (!u) return "Email yoki parol noto'g'ri";
      setSession(u.id);
      return null;
    },
    logout: () => setSession(null),
    setAvatar: (src) => patch((u) => ({ ...u, avatar: src })),
    changePassword: (current, next) => {
      if (!user) return "Tizimga kiring";
      if (user.password !== current) return "Joriy parol noto'g'ri";
      if (next.length < 6) return "Yangi parol kamida 6 belgidan iborat bo'lsin";
      patch((u) => ({ ...u, password: next }));
      return null;
    },
    addPhoto: (src, caption) =>
      patch((u) => ({ ...u, photos: [{ id: crypto.randomUUID(), src, caption, createdAt: Date.now() }, ...u.photos] })),
    updateCaption: (id, caption) =>
      patch((u) => ({ ...u, photos: u.photos.map((p) => (p.id === id ? { ...p, caption } : p)) })),
    deletePhoto: (id) => patch((u) => ({ ...u, photos: u.photos.filter((p) => p.id !== id) })),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
