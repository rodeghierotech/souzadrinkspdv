"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Wine } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn.email({
          email: form.email,
          password: form.password,
        });

        if (error) {
          toast.error("Email ou senha incorretos");
          return;
        }
        toast.success("Bem-vindo à Santa Adega!");
        router.push("/pdv");
        router.refresh();
      } else {
        const { error } = await signUp.email({
          name: form.name,
          email: form.email,
          password: form.password,
        });

        if (error) {
          toast.error(error.message || "Erro ao criar conta");
          return;
        }
        toast.success("Conta criada com sucesso!");
        router.push("/pdv");
        router.refresh();
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold/3 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-4">
            <Wine className="w-8 h-8 text-gold" />
          </div>
          <h1
            className="text-3xl font-bold gold-text mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Santa Adega
          </h1>
          <p className="text-text-muted text-sm">Sistema de Ponto de Venda</p>
        </div>

        {/* Card */}
        <div className="bg-surface-elevated border border-border rounded-2xl p-6 shadow-gold">
          <h2 className="text-text-primary font-semibold text-lg mb-5">
            {mode === "login" ? "Entrar no sistema" : "Criar conta admin"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-text-secondary text-sm mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  className="input-dark w-full"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-text-secondary text-sm mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  className="input-dark w-full pl-9"
                  placeholder="admin@santaadega.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-dark w-full pl-9 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-gold w-full py-2.5 mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : null}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-text-muted text-sm hover:text-gold transition-colors"
            >
              {mode === "login"
                ? "Primeira vez? Criar conta admin"
                : "Já tem conta? Entrar"}
            </button>
          </div>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          © 2025 Santa Adega · PDV v1.0
        </p>
      </div>
    </div>
  );
}
