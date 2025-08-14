import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/Header";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Overview } from "@/components/dashboard/Overview";

export const metadata: Metadata = {
  title: "Dashboard - FaceRec CFTV",
  description: "Painel de controle do sistema FaceRec",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Bem-vindo ao seu painel de controle."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Overview />
      </div>
    </DashboardShell>
  );
}
