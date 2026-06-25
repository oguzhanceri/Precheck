import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_30rem),linear-gradient(135deg,#030712,#07111f)] px-4 py-16 text-white">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-slate-950">P</span>
          <span className="font-semibold tracking-[-0.02em]">Precheck AI</span>
        </Link>
        <h1 className="mt-10 text-4xl font-semibold tracking-[-0.07em]">Hesabına giriş yap.</h1>
        <form className="mt-8 grid gap-4">
          <Input placeholder="E-posta" type="email" />
          <Input placeholder="Şifre" type="password" />
          <Button type="button" className="w-full">Devam Et</Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/50">Hesabın yok mu? Kayıt akışı sonraki adımda bağlanacak.</p>
      </Card>
    </main>
  );
}
