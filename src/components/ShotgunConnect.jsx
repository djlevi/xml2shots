import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, PlusCircle, CheckCircle, Upload } from 'lucide-react';

export default function ShotgunConnect({ sequenceId, shots, onShotsCreated }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/shotgun/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiUrl, scriptName, apiKey })
      });

      if (!response.ok) throw new Error('Failed to connect to Shotgun');

      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShots = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    setError('');
    setCreating(true);

    try {
      const response = await fetch('/api/shotgun/create-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl,
          scriptName,
          apiKey,
          projectId: selectedProject,
          shots
        })
      });

      if (!response.ok) throw new Error('Failed to create shots in Shotgun');

      const data = await response.json();
      setSuccess(`Successfully created ${data.created} shots in Shotgun`);
      onShotsCreated(data.shotgunIds);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: '1.5rem'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#f7fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Database size={20} />
        Shotgun Integration
      </h3>

      {!projects.length ? (
        <form onSubmit={handleConnect}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Shotgun API URL</label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-site.shotgunstudio.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Script Name</label>
            <input
              type="text"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="Your script name"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API key"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Connecting...' : 'Connect to Shotgun'}
          </button>
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={inputStyle}
            >
              <option value="">Choose a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateShots}
            disabled={creating || !selectedProject}
            style={{
              ...buttonStyle,
              opacity: creating || !selectedProject ? 0.7 : 1,
              cursor: creating || !selectedProject ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}
          >
            {creating ? (
              <>
                <Upload size={16} />
                Creating Shots...
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                Create Shots in Shotgun
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#86efac',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px',
        color: '#93c5fd',
        fontSize: '0.75rem'
      }}>
        Note: Shotgun integration requires API credentials. This feature creates shots and sequences in your Shotgun project.
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#e2e8f0'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#f7fafc',
  fontSize: '0.875rem',
  outline: 'none'
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: '600',
  transition: 'all 0.2s'
};
