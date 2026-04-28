import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-emeraldApp-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-emeraldApp-700 text-white p-2.5 rounded-xl">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50">Payflow</h1>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-emeraldApp-900 dark:text-emeraldApp-50 mb-1">
            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
          </h2>
          <p className="text-sm text-emeraldApp-900/75 dark:text-emeraldApp-100/80 mb-6">
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
              <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emeraldApp-900/40 dark:text-emeraldApp-100/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-emeraldApp-200 pl-10 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emeraldApp-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-emeraldApp-900/75 dark:text-emeraldApp-100/80">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emeraldApp-900/40 dark:text-emeraldApp-100/40" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-emeraldApp-200 pl-10 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emeraldApp-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:[color-scheme:dark] dark:placeholder:text-gray-400"
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
  );
}
