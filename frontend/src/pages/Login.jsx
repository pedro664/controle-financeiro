import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PremiumLineCard } from "../components/premium";
import { Sparkles, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoLineData = [
    { label: "Jan", value: 3200 },
    { label: "Fev", value: 4500 },
    { label: "Mar", value: 3800 },
    { label: "Abr", value: 5200 },
    { label: "Mai", value: 4900 },
    { label: "Jun", value: 6100 },
  ];

  return (
    <div className="min-h-screen flex bg-emeraldApp-50 dark:bg-gray-950">
      {/* Premium visual side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0D10] items-center justify-center p-8">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="absolute">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DA004E" />
                <stop offset="50%" stopColor="#4500D8" />
                <stop offset="100%" stopColor="#0685CD" />
              </linearGradient>
            </defs>
            <circle cx="80%" cy="20%" r="200" fill="url(#lg1)" opacity="0.15" filter="blur(60px)" />
            <circle cx="20%" cy="80%" r="180" fill="#7209B7" opacity="0.1" filter="blur(60px)" />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-sm space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emeraldApp-600 text-white p-2.5 rounded-xl">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-white">Payflow</h1>
          </div>
          <p className="text-lg text-gray-400 leading-relaxed mb-6">
            Controle suas finanças com elegância. Visualize, planeje e alcance seus objetivos financeiros.
          </p>
          <PremiumLineCard
            title="Crescimento"
            subtitle="Demonstração"
            data={demoLineData}
            metric1={{ label: "Mín", value: 3200 }}
            metric2={{ label: "Méd", value: 4617 }}
            metric3={{ label: "Máx", value: 6100 }}
          />
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="bg-emeraldApp-700 text-white p-2.5 rounded-xl">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Payflow</h1>
          </div>

          <Card className="dark:border-gray-800 dark:bg-[#0A0D10]">
            <h2 className="text-xl font-bold text-emeraldApp-900 dark:text-white mb-1">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </h2>
            <p className="text-sm text-emeraldApp-900/75 dark:text-gray-400 mb-6">
              {isLogin ? "Entre com seu email e senha" : "Preencha seus dados para começar"}
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-gray-400">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emeraldApp-900/40 dark:text-gray-500" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-emeraldApp-200 pl-10 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emeraldApp-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-gray-400">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emeraldApp-900/40 dark:text-gray-500" />
                  <input
                    type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-lg border border-emeraldApp-200 pl-10 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emeraldApp-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-sm text-emeraldApp-700 hover:underline dark:text-emeraldApp-300"
              >
                {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
