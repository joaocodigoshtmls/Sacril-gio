import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@/components/auth/SignInButton";

export const metadata: Metadata = {
  title: "Login - FaceRec CFTV",
  description: "Entre na sua conta FaceRec",
};

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="/images/auth-bg.jpg"
            fill
            alt="Câmeras de segurança"
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/facerec-logo.png"
            alt="FaceRec"
            width={150}
            height={50}
            className="mr-2"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Sistema de monitoramento CFTV com reconhecimento facial
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-muted-foreground">
              Faça login para acessar o sistema
            </p>
          </div>
          <SignInButton />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
