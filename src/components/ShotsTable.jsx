import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clapperboard, Copy, CheckCircle } from 'lucide-react';
import ShotgunConnect from './ShotgunConnect';

export default function ShotsTable({ sequenceId, sequenceName, framerate }) {
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShotgun, setShowShotgun] = useState(false);

  useEffect(() => {
    loadShots();
  }, [sequenceId]);

  const loadShots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shots')
      .select('*')
      .eq('sequence_id', sequenceId)
      .order('cut_order', { ascending: true });

    if (!error && data) {
      setShots(data);
    }
    setLoading(false);
  };

  const copyTableData = () => {
    const headers = ['Shot Code', 'Sequence', 'Cut Order', 'Source TC In', 'Source TC Out',
      'Record TC In', 'Record TC Out', 'Cut In', 'Cut Out', 'Cut Duration', 'Path'];

    const rows = shots.map(shot => [
      shot.shot_code,
      sequenceName,
      shot.cut_order,
      shot.source_tc_in,
      shot.source_tc_out,
      shot.record_tc_in,
      shot.record_tc_out,
      shot.cut_in,
      shot.cut_out,
      shot.cut_duration,
      shot.pathurl
    ]);

    const csv = [headers, ...rows].map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShotsCreated = async (shotgunIds) => {
    await loadShots();
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: '#a0aec0'
      }}>
        Loading shots...
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#f7fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clapperboard size={20} />
          {sequenceName} Shots ({shots.length})
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowShotgun(!showShotgun)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: showShotgun ? 'rgba(34, 197, 94, 0.1)' : 'rgba(147, 51, 234, 0.1)',
              border: `1px solid ${showShotgun ? 'rgba(34, 197, 94, 0.3)' : 'rgba(147, 51, 234, 0.3)'}`,
              borderRadius: '8px',
              color: showShotgun ? '#86efac' : '#c084fc',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {showShotgun ? 'Hide' : 'Shotgun'}
          </button>

          <button
            onClick={copyTableData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '8px',
              color: copied ? '#86efac' : '#60a5fa',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.target.style.background = 'rgba(59, 130, 246, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
              }
            }}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Table'}
          </button>
        </div>
      </div>

      <div style={{
        fontSize: '0.875rem',
        color: '#a0aec0',
        marginBottom: '1rem'
      }}>
        FPS: {framerate}
      </div>

      <div style={{
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: '600px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 10
          }}>
            <tr>
              <th style={headerStyle}>Shot Code</th>
              <th style={headerStyle}>Cut Order</th>
              <th style={headerStyle}>Source TC In</th>
              <th style={headerStyle}>Source TC Out</th>
              <th style={headerStyle}>Record TC In</th>
              <th style={headerStyle}>Record TC Out</th>
              <th style={headerStyle}>Cut In</th>
              <th style={headerStyle}>Cut Out</th>
              <th style={headerStyle}>Duration</th>
              <th style={headerStyle}>Clip Name</th>
            </tr>
          </thead>
          <tbody>
            {shots.map((shot, index) => (
              <tr
                key={shot.id}
                style={{
                  background: index % 2 === 0
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <td style={cellStyle}>{shot.shot_code}</td>
                <td style={cellStyle}>{shot.cut_order}</td>
                <td style={cellStyle}>{shot.source_tc_in}</td>
                <td style={cellStyle}>{shot.source_tc_out}</td>
                <td style={cellStyle}>{shot.record_tc_in}</td>
                <td style={cellStyle}>{shot.record_tc_out}</td>
                <td style={cellStyle}>{shot.cut_in}</td>
                <td style={cellStyle}>{shot.cut_out}</td>
                <td style={cellStyle}>{shot.cut_duration}</td>
                <td style={{
                  ...cellStyle,
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={shot.clip_name}>
                  {shot.clip_name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showShotgun && (
        <ShotgunConnect
          sequenceId={sequenceId}
          shots={shots}
          onShotsCreated={handleShotsCreated}
        />
      )}
    </div>
  );
}

const headerStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  color: '#e2e8f0',
  fontWeight: '600',
  borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
  whiteSpace: 'nowrap'
};

const cellStyle = {
  padding: '0.75rem',
  color: '#cbd5e0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  whiteSpace: 'nowrap'
};
