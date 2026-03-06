import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import { login, type LoginPayload } from "@/api/auth";
import { useSession } from "@/features/auth/hooks/use-session";
import type { AuthSessionResponse } from "@/types/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation<AuthSessionResponse, Error, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data);
      navigate("/dashboard", { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <img className="auth-card__logo" src="/VCRM.png" alt="VCRM" />
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              autoComplete="current-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {loginMutation.error ? (
            <p className="form-error">{loginMutation.error.message}</p>
          ) : (
            <p className="form-hint">Use um usuário já cadastrado no backend para entrar.</p>
          )}
          <p className="form-hint">
            Politica de privacidade:{" "}
            <Link className="text-link" to="/privacy-policy">
              abrir documento
            </Link>
            .
          </p>

          <button className="primary-link" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}
