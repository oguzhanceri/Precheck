import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <AppShell activePath="/settings" title="Ayarlar / Takım" eyebrow="Workspace">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-2xl font-semibold tracking-[-0.05em]">Takım bilgileri</h2>
          <div className="mt-6 grid gap-4">
            <Input defaultValue="Precheck Studio" />
            <Input defaultValue="team@precheck.ai" />
            <Button type="button" className="w-full sm:w-max">Değişiklikleri Kaydet</Button>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold tracking-[-0.05em]">Üyeler</h2>
          <div className="mt-6 grid gap-3">
            {["Oğuzhan Çeri", "Frontend Reviewer", "Project Manager"].map((member) => (
              <div key={member} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span>{member}</span>
                <span className="text-sm text-white/40">Aktif</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
