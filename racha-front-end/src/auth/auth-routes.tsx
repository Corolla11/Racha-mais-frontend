import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";

function LoadingSession() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
      Verificando sua sessão...
    </main>
  );
}

export function ProtectedRoute() {
  const { user, isLoading, sessionError, refreshSession } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSession />;
  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="max-w-lg rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Não foi possível verificar sua sessão
          </h1>
          <p role="alert" className="mt-2 text-sm text-red-700">
            {sessionError}
          </p>
          <button
            type="button"
            onClick={() => void refreshSession().catch(() => undefined)}
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSession />;
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}
