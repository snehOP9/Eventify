import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Compass, LogIn, LogOut, Search, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AUTH_STATE_CHANGED_EVENT,
  clearAuthSession,
  getCurrentAuthIdentity
} from "../../services/authService";
import { logoutOAuthSession } from "../../services/oauthService";

const baseCommands = [
  { id: "home", label: "Go to Home", shortcut: "H", icon: Sparkles, path: "/" },
  { id: "events", label: "Browse Events", shortcut: "E", icon: Compass, path: "/events" },
  { id: "free", label: "Open Free Events", shortcut: "F", icon: Compass, path: "/events/free" },
  { id: "premium", label: "Open Premium Events", shortcut: "P", icon: Compass, path: "/events/premium" },
  { id: "dashboard", label: "Open User Dashboard", shortcut: "D", icon: ArrowRight, path: "/dashboard" },
  { id: "organizer", label: "Open Organizer Studio", shortcut: "O", icon: ArrowRight, path: "/organizer" },
  { id: "register", label: "Register Featured Event", shortcut: "R", icon: ArrowRight, path: "/register/neo-summit-2026" }
];

const authCommands = {
  login: {
    id: "login",
    label: "Sign In",
    shortcut: "L",
    icon: LogIn,
    path: "/login"
  },
  logout: {
    id: "logout",
    label: "Sign Out",
    shortcut: "L",
    icon: LogOut,
    action: "logout"
  }
};

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [authIdentity, setAuthIdentity] = useState(() => getCurrentAuthIdentity());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncAuthProfile = () => setAuthIdentity(getCurrentAuthIdentity());

    window.addEventListener("storage", syncAuthProfile);
    window.addEventListener("focus", syncAuthProfile);
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthProfile);

    return () => {
      window.removeEventListener("storage", syncAuthProfile);
      window.removeEventListener("focus", syncAuthProfile);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthProfile);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const commands = useMemo(() => {
    const authAction = authIdentity.isAuthenticated ? authCommands.logout : authCommands.login;
    return [...baseCommands, authAction];
  }, [authIdentity.isAuthenticated]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return commands;
    }

    return commands.filter((command) => {
      const haystack = `${command.label} ${command.shortcut}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex((current) => {
      if (filteredCommands.length === 0) {
        return 0;
      }

      return Math.min(current, filteredCommands.length - 1);
    });
  }, [filteredCommands]);

  const closePalette = () => {
    setIsOpen(false);
  };

  const runCommand = async (command) => {
    if (!command) {
      return;
    }

    if (command.action === "logout") {
      try {
        await logoutOAuthSession();
      } catch {
        // Local session is still cleared if remote logout fails.
      } finally {
        clearAuthSession();
        navigate("/login", { replace: true });
      }
      closePalette();
      return;
    }

    if (command.path && command.path !== location.pathname) {
      navigate(command.path);
    }

    closePalette();
  };

  const handleListKeyDown = (event) => {
    if (filteredCommands.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % filteredCommands.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + filteredCommands.length) % filteredCommands.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(filteredCommands[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-[rgba(3,6,18,0.8)] backdrop-blur-xl"
          onClick={closePalette}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="command-palette-shell mx-auto mt-[10vh] w-[min(720px,92vw)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="command-palette-header">
              <div className="command-palette-pill">
                <Sparkles size={14} />
                Command Center
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/38">Ctrl/Cmd + K</div>
            </div>

            <label className="command-search-wrap">
              <Search size={18} className="command-search-icon" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleListKeyDown}
                placeholder="Search commands, pages, and actions..."
                className="command-search-input"
              />
            </label>

            <div className="command-list" role="listbox" aria-label="Command results">
              {filteredCommands.length === 0 ? (
                <div className="command-empty">No matching commands found.</div>
              ) : (
                filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    type="button"
                    className={`command-item ${index === selectedIndex ? "is-active" : ""}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => runCommand(command)}
                  >
                    <div className="command-item-left">
                      <div className="command-item-icon">
                        <command.icon size={16} />
                      </div>
                      <span className="command-item-label">{command.label}</span>
                    </div>
                    <span className="command-item-key">{command.shortcut}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default CommandPalette;
