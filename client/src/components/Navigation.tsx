import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/tree", label: "Family Tree" },
    { href: "/photos", label: "Photos" },
    { href: "/about", label: "About" },
  ];

  // Add admin link if user is admin
  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="bg-white border-b border-[#3D5A40]/10 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link href={isAuthenticated ? "/directory" : "/"}>
            <a className="text-xl font-serif font-bold text-[#2C3E3C] hover:text-[#3D5A40] transition-colors">
              The PMs Family Archive
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a
                      className={`text-sm font-medium transition-colors ${
                        location === link.href
                          ? "text-[#3D5A40] font-semibold"
                          : "text-[#5A6B5F] hover:text-[#3D5A40]"
                      }`}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#3D5A40]/10">
                  <div className="flex items-center gap-2 text-sm text-[#5A6B5F]">
                    <User className="w-4 h-4" />
                    <span>{user?.name || user?.email}</span>
                    {user?.role === "admin" && (
                      <span className="px-2 py-0.5 bg-[#3D5A40]/10 text-[#3D5A40] text-xs rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-[#5A6B5F] hover:text-[#3D5A40]"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          {isAuthenticated && (
            <button
              className="md:hidden p-2 text-[#5A6B5F] hover:text-[#3D5A40]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#3D5A40]/10">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === link.href
                        ? "bg-[#3D5A40]/10 text-[#3D5A40]"
                        : "text-[#5A6B5F] hover:bg-[#F5F5F0]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-[#3D5A40]/10">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#5A6B5F]">
                  <User className="w-4 h-4" />
                  <span>{user?.name || user?.email}</span>
                  {user?.role === "admin" && (
                    <span className="px-2 py-0.5 bg-[#3D5A40]/10 text-[#3D5A40] text-xs rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-[#5A6B5F] hover:text-[#3D5A40]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
