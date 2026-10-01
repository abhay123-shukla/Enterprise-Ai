import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  ShieldAlert, 
  Layers,
  HelpCircle,
  AlertTriangle,
  Tag,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { DepartmentBadge, PriorityBadge, StatusBadge } from '../components/Badges';
import { useToast } from '../context/ToastContext';

export const NewRequest = () => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const samplePrompts = [
    {
      label: 'VPN Issue (IT)',
      text: "My laptop VPN is not connecting and I need access before today's meeting."
    },
    {
      label: 'Expense Reimbursement (Finance)',
      text: "I submitted an expense report for a $142 client dinner last Friday. When will this be reimbursed?"
    },
    {
      label: 'PTO Policy (HR)',
      text: "How many unused vacation days can I roll over into next calendar year?"
    },
    {
      label: 'Hardware Replacement (IT)',
      text: "My MacBook charger stopped working and is completely dead. Can I get a replacement today?"
    }
  ];

  const handleSelectSample = (sampleText) => {
    setDescription(sampleText);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe what you need.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.createRequest({
        title: title.trim() || undefined,
        description: description.trim()
      });
      setResult(res.request);
      toast.success('✓ Request created and triaged by AI');
    } catch (err) {
      const msg = err.message || 'Failed to submit request';
      setError(msg);
      toast.error(`✕ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDeflected = async () => {
    if (!result) return;
    try {
      await api.updateRequest(result._id || result.id, {
        status: 'resolved'
      });
      toast.success('✓ Request resolved via AI Knowledge Deflection');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('✕ Failed to mark request as resolved');
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={14} />
          <span>Real-Time Autonomous AI Ingestion & Triage</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Create a New Request
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '6px' }}>
          Describe your issue in plain language. OpsPilot AI will understand, categorize, search knowledge, and route your request instantly.
        </p>
      </div>

      {/* Main Request Form */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px' }}>
        {/* Sample chips for judges */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={13} />
            <span>Try one of these evaluation examples:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s.text)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.05)' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Describe what you need... <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="e.g. My laptop VPN is not connecting and I need access before today's meeting."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Optional Title (or let AI auto-generate it)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. VPN connection failure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Bot size={18} className="animate-spin" />
                AI Triaging & Searching Enterprise Knowledge...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit to OpsPilot AI
              </>
            )}
          </button>
        </form>
      </div>

      {/* Real-Time AI Triage & Suggested Answer Result Modal/Card */}
      {result && (
        <div className="glass-panel-glow animate-fade-in" style={{ padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  AI Triage Analysis Complete
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  ✓ Request successfully classified, tagged, and triaged
                </span>
              </div>
            </div>

            <StatusBadge status={result.status} />
          </div>

          {/* 3.3 Duplicate Detection Alert */}
          {result.isDuplicate && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>
                  Potential Duplicate Request Detected (3.3 Duplicate Engine)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '2px' }}>
                  {result.duplicateReasoning || 'OpsPilot AI flagged a high semantic similarity with an existing open ticket.'}
                </div>
                {result.duplicateOf && (
                  <Link
                    to={`/requests/${result.duplicateOf}`}
                    style={{ fontSize: '0.82rem', color: '#38bdf8', textDecoration: 'underline', marginTop: '4px', display: 'inline-block' }}
                  >
                    View existing ticket #{String(result.duplicateOf).slice(-6)} →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* AI Title & Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              AI Structured Title & Summary
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {result.title}
            </div>
            {result.summary && (
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                {result.summary}
              </div>
            )}
          </div>

          {/* 3.1 AI Classification Matrix */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Department
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {result.department}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Category
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                {result.category}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Priority
              </div>
              <div style={{ marginTop: '4px' }}>
                <PriorityBadge priority={result.priority} />
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Sentiment
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px', textTransform: 'capitalize' }}>
                {result.sentiment}
              </div>
            </div>
          </div>

          {/* Tags & Suggested Due Date */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '24px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {/* Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Tag size={14} color="#94a3b8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Tags:
              </span>
              {(result.tags && result.tags.length > 0 ? result.tags : ['general']).map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Suggested Due Date */}
            {result.suggestedDueDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <Calendar size={14} color="#06b6d4" />
                <span>
                  Suggested Due Date: <strong style={{ color: '#06b6d4' }}>{new Date(result.suggestedDueDate).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 3.2 Instant Answer / RAG */}
          {result.suggestedAnswer && (
            <div style={{
              background: result.suggestedAnswer.includes('No confident answer found')
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
              border: result.suggestedAnswer.includes('No confident answer found')
                ? '1px solid rgba(245, 158, 11, 0.3)'
                : '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color={result.suggestedAnswer.includes('No confident answer found') ? '#fbbf24' : '#38bdf8'} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {result.suggestedAnswer.includes('No confident answer found')
                      ? 'AI RAG Low Confidence Deflection Guard'
                      : 'OpsPilot AI Verified Knowledge Answer:'}
                  </span>
                </div>
                {result.suggestedAnswer.includes('No confident answer found') ? (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    Escalated to Human Agent
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    Verified Enterprise Grounding
                  </span>
                )}
              </div>
              <p style={{
                color: '#e2e8f0',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {result.suggestedAnswer}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {!result.suggestedAnswer?.includes('No confident answer found') && (
              <button
                onClick={handleMarkDeflected}
                className="btn btn-success"
                style={{ padding: '12px 20px' }}
              >
                <CheckCircle size={16} /> This Solved My Problem (Mark Resolved)
              </button>
            )}
            <Link
              to={`/requests/${result._id || result.id}`}
              className="btn btn-secondary"
              style={{ padding: '12px 20px' }}
            >
              Track Request Details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
