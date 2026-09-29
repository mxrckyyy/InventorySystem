import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(undefined);

export const ADMIN_ROLE = 'Admin';
export const VIEWER_ROLE = 'Viewer';

function resolveRole(user) {
  const raw = user?.user_metadata?.role || user?.app_metadata?.role;
  return String(raw).toLowerCase() === 'admin' ? ADMIN_ROLE : VIEWER_ROLE;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setInitializing(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { success: false, error: error.message };

    setUser(data.user);
    return { success: true };
  }, []);

  const signup = useCallback(async (email, password, role = VIEWER_ROLE) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: role.toLowerCase() }
      }
    });

    if (error) return { success: false, error: error.message };

    if (data.session) {
      setUser(data.session.user);
      return { success: true, needsConfirmation: false };
    }

    return {
      success: true,
      needsConfirmation: true,
      email: data.user?.email || email
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const role = resolveRole(user);
  const isAdmin = user ? role === ADMIN_ROLE : false;

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin,
      initializing,
      login,
      signup,
      logout
    }),
    [user, role, isAdmin, initializing, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
