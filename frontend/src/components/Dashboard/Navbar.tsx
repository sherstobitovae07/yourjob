
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "../../services/authService";
interface NavbarProps {
  showProfileLink?: string;
}
export default function Navbar({ showProfileLink }: NavbarProps) {
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/auth");
  };
  return (
    <div className="header">
      <div className="headerContent">
        <div className="logo">
          <Link href="/">YourJob</Link>
        </div>
        <div className="authButtons">
          {showProfileLink && (
            <Link
              href={showProfileLink}
              className="navbar-profile-link"
            >
              Профиль
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="navbar-logout-btn"
          >
            Выход
          </button>
        </div>
      </div>
    </div>
  );
}
