import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { parseXML } from '../utils/xmlParser';
import { Upload, FileText, Loader } from 'lucide-react';

export default function XMLUploader({ userId, onSequenceCreated }) {
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const text = await file.text();
      const { sequenceInfo, shots } = parseXML(text);

      const { data: sequence, error: seqError } = await supabase
        .from('sequences')
        .insert({
          name: sequenceInfo.name,
          framerate: sequenceInfo.framerate,
          cut_duration: sequenceInfo.cutDuration,
          tc_in: sequenceInfo.tcIn,
          tc_out: sequenceInfo.tcOut,
          cut_in: sequenceInfo.cutIn,
          cut_out: sequenceInfo.cutOut,
          xml_file_name: file.name,
          user_id: userId
        })
        .select()
        .maybeSingle();

      if (seqError) throw seqError;

      const shotsToInsert = shots.map(shot => ({
        sequence_id: sequence.id,
        shot_code: shot.shotCode,
        cut_order: shot.cutOrder,
        source_tc_in: shot.sourceTcIn,
        source_tc_out: shot.sourceTcOut,
        record_tc_in: shot.recordTcIn,
        record_tc_out: shot.recordTcOut,
        cut_in: shot.cutIn,
        cut_out: shot.cutOut,
        cut_duration: shot.cutDuration,
        pathurl: shot.pathurl,
        clip_name: shot.clipName,
        user_id: userId
      }));

      const { error: shotsError } = await supabase
        .from('shots')
        .insert(shotsToInsert);

      if (shotsError) throw shotsError;

      setSuccess(`Successfully imported ${shots.length} shots from ${sequenceInfo.name}`);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSequenceCreated();
    } catch (err) {
      setError(err.message || 'Failed to parse XML file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
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
        <Upload size={20} />
        Upload XML File
      </h2>

      <div style={{
        border: '2px dashed rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
        background: 'rgba(59, 130, 246, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
      }}
      onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Loader size={40} color="#3b82f6" style={{
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
              Processing XML file...
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FileText size={40} color="#3b82f6" />
            <div>
              <p style={{
                color: '#e2e8f0',
                fontSize: '1rem',
                marginBottom: '0.25rem'
              }}>
                {fileName || 'Click to select XML file'}
              </p>
              <p style={{
                color: '#a0aec0',
                fontSize: '0.875rem'
              }}>
                DaVinci Resolve or Final Cut Pro XML
              </p>
            </div>
          </div>
        )}
      </div>

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
          fontSize: '0.875rem'
        }}>
          {success}
        </div>
      )}
    </div>
  );
}
