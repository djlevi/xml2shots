import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Upload, Database } from 'lucide-react';
import XMLUploader from './XMLUploader';
import SequenceList from './SequenceList';
import ShotsTable from './ShotsTable';

export default function Dashboard({ session }) {
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSequenceCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSequenceSelect = (sequence) => {
    setSelectedSequence(sequence);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    }}>
      <header style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Database size={28} color="#3b82f6" />
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#f7fafc'
          }}>
            XML to Shotgun
          </h1>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{
            fontSize: '0.875rem',
            color: '#a0aec0'
          }}>
            {session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      <main style={{
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        <div style={{
          marginBottom: '2rem'
        }}>
          <XMLUploader
            userId={session.user.id}
            onSequenceCreated={handleSequenceCreated}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedSequence ? '300px 1fr' : '1fr',
          gap: '1.5rem'
        }}>
          <SequenceList
            userId={session.user.id}
            refreshKey={refreshKey}
            onSequenceSelect={handleSequenceSelect}
            selectedSequence={selectedSequence}
          />

          {selectedSequence && (
            <ShotsTable
              sequenceId={selectedSequence.id}
              sequenceName={selectedSequence.name}
              framerate={selectedSequence.framerate}
            />
          )}
        </div>
      </main>
    </div>
  );
}
