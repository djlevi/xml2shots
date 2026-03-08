import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Film, Trash2 } from 'lucide-react';

export default function SequenceList({ userId, refreshKey, onSequenceSelect, selectedSequence }) {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSequences();
  }, [userId, refreshKey]);

  const loadSequences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sequences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSequences(data);
    }
    setLoading(false);
  };

  const handleDelete = async (sequenceId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this sequence and all its shots?')) return;

    const { error } = await supabase
      .from('sequences')
      .delete()
      .eq('id', sequenceId);

    if (!error) {
      setSequences(sequences.filter(s => s.id !== sequenceId));
      if (selectedSequence?.id === sequenceId) {
        onSequenceSelect(null);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: '#a0aec0'
      }}>
        Loading sequences...
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: 'fit-content'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#f7fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Film size={20} />
        Sequences
      </h2>

      {sequences.length === 0 ? (
        <p style={{
          color: '#a0aec0',
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: '1rem'
        }}>
          No sequences yet. Upload an XML file to get started.
        </p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {sequences.map(sequence => (
            <div
              key={sequence.id}
              onClick={() => onSequenceSelect(sequence)}
              style={{
                padding: '1rem',
                background: selectedSequence?.id === sequence.id
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${selectedSequence?.id === sequence.id
                  ? 'rgba(59, 130, 246, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                if (selectedSequence?.id !== sequence.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSequence?.id !== sequence.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  color: '#f7fafc',
                  marginBottom: '0.25rem'
                }}>
                  {sequence.name}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#a0aec0'
                }}>
                  {sequence.framerate} fps • {sequence.cut_duration} frames
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(sequence.id, e)}
                style={{
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
