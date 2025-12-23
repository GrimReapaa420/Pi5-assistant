import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "wouter"
import { Menu, X, LayoutDashboard, Settings, FileText, Info, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-provider"

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/config", label: "Configuration", icon: Settings },
  { path: "/logs", label: "Logs", icon: FileText },
  { path: "/about", label: "About", icon: Info },
]

function useIsMobileSimple() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.clientWidth < 768
    }
    return false
  })

  useEffect(() => {
    const check = () => {
      setIsMobile(document.documentElement.clientWidth < 768)
    }
    check()
    window.addEventListener("resize", check)
    document.addEventListener("visibilitychange", check)
    const interval = setInterval(check, 500)
    return () => {
      window.removeEventListener("resize", check)
      document.removeEventListener("visibilitychange", check)
      clearInterval(interval)
    }
  }, [])

  return isMobile
}

export function ResponsiveNav() {
  const [location] = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobileSimple()
  const { theme, setTheme } = useTheme()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const ThemeToggle = () => (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-menu-toggle"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <span className="font-semibold text-sm">Pironman5 Lite</span>
          </div>
          <ThemeToggle />
        </div>
        
        {menuOpen && (
          <div ref={menuRef} className="border-t bg-background">
            <nav className="flex flex-col p-2 gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location === item.path
                const Icon = item.icon
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      data-testid={`button-nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Pironman5 Lite</span>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path
              const Icon = item.icon
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid={`button-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
