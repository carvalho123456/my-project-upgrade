import { Link } from "react-router-dom";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserMenu = () => {
  const { user, displayName, signOut, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-md hover:bg-primary-foreground/20 transition"
      >
        <LogIn className="h-3.5 w-3.5" />
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground">
        <UserRound className="h-3.5 w-3.5" />
        {displayName ?? user.email?.split("@")[0]}
      </span>
      <button
        onClick={signOut}
        aria-label="Sair da conta"
        className="rounded-full border border-primary-foreground/20 p-1.5 text-primary-foreground hover:bg-primary-foreground/10 transition"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default UserMenu;
