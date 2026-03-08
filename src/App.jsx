import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#a0aec0'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {!session ? <AuthForm /> : <Dashboard session={session} />}
    </div>
  );
}

export default App;
