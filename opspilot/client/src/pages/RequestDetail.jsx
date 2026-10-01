import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, DepartmentBadge, RoleBadge, SlaTimer } from '../components/Badges';
import { 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  MessageSquare, 
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Skeleton, SkeletonCard } from '../components/Skeleton';
import { ErrorState } from '../components/FeedbackStates';

export const RequestDetail = () => {
  const { id } = useParams();
  const { user, isAgent, isAdmin } = useAuth();
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const toast = useToast();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRequestById(id);
      setRequest(res.request);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Failed to load request detail:', err);
      setError(err.message || 'Unable to load ticket details from the server.');
      toast.error('✕ Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentSubmitting(true);
      const res = await api.addComment(id, { content: newComment.trim() });
      setComments([...comments, res.comment]);
      setNewComment('');
      toast.success('✓ Comment posted successfully');
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error(err.message || '✕ Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      const res = await api.summarizeThread(id);
      setRequest({ ...request, aiSummary: res.summary });
      toast.success('✓ Thread summarized by AI');
    } catch (err) {
      console.error('Summarize failed:', err);
      toast.error('✕ Failed to summarize thread');
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateDraft = async () => {
    try {
      setDrafting(true);
      const res = await api.generateDraftReply(id);
      setRequest({ ...request, suggestedDraftReply: res.draft });
      toast.success('✓ AI contextual draft generated');
    } catch (err) {
      console.error('Draft generation failed:', err);
      toast.error('✕ Failed to generate draft reply');
    } finally {
      setDrafting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.updateRequest(id, { status: newStatus });
      setRequest(res.request);
      toast.success(`✓ Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('✕ Status update failed');
    }
  };

  const handleAssignToMe = async () => {
    try {
      const res = await api.assignRequest(id);
      setRequest(res.request);
      toast.success('✓ Request assigned to your queue');
    } catch (err) {
      console.error('Assign failed:', err);
      toast.error('✕ Assignment failed');
    }
  };

  const copyToInput = (text) => {
    setNewComment(text);
    setCopiedDraft(true);
    toast.success('✓ Draft copied to comment composer');
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // 4.2 Loading Skeleton State
  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <Skeleton width="160px" height="24px" style={{ marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '24px' }}>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
        </div>
      </div>
    );
  }

  // 4.3 Error State with Try Again
  if (error || !request) {
    return (
      <ErrorState
        title="Unable to load request details"
        message={error || 'The requested ticket could not be found or has been removed.'}
        onRetry={fetchDetails}
        retryLabel="Try Again"
      />
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      {/* Back button */}
      <div style={{ marginBottom: '18px' }}>
        <Link
          to={isAgent || isAdmin ? '/agent-queue' : '/my-requests'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}
        >
          <ChevronLeft size={16} /> Back to Requests
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '24px' }}>
        {/* Left Column: Request Details, AI Summary, Comments */}
        <div>
          {/* Main Card */}
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Ticket #{request._id?.slice(-6).toUpperCase()}
                </span>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {request.title}
                </h1>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <DepartmentBadge department={request.department} />
              <PriorityBadge priority={request.priority} />
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}>
                Category: <strong>{request.category}</strong>
              </span>
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}>
                Sentiment: <strong>{request.sentiment}</strong>
              </span>
            </div>

            {/* 3.3 Duplicate Notice */}
            {request.isDuplicate && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>AI Duplicate Ticket Notice:</strong>
                  <span style={{ color: '#e2e8f0', marginLeft: '6px', fontSize: '0.85rem' }}>
                    {request.duplicateReasoning || 'This ticket was flagged by AI as a duplicate of an existing open request.'}
                  </span>
                  {request.duplicateOf && (
                    <Link
                      to={`/requests/${request.duplicateOf._id || request.duplicateOf}`}
                      style={{ color: '#38bdf8', marginLeft: '8px', fontSize: '0.85rem', textDecoration: 'underline' }}
                    >
                      View Original #{String(request.duplicateOf._id || request.duplicateOf).slice(-6).toUpperCase()} →
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '18px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Original Description:
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {request.description}
              </p>
            </div>

            {/* Instant AI Suggested Answer (from Deflection engine) */}
            {request.suggestedAnswer && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                  <Bot size={16} />
                  <span>AI Knowledge Suggestion (at intake):</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {request.suggestedAnswer}
                </div>
              </div>
            )}
          </div>

          {/* AI SUMMARY BOX (Required by 2.9) */}
          <div className="glass-panel-glow" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  AI Copilot Snapshot & Summary
                </h3>
              </div>
              {(isAgent || isAdmin) && (
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="btn btn-secondary btn-sm"
                >
                  <RefreshCw size={13} className={summarizing ? 'animate-spin' : ''} />
                  {summarizing ? 'Summarizing...' : 'Summarize Thread'}
                </button>
              )}
            </div>

            <div style={{
              background: 'rgba(10, 13, 20, 0.6)',
              borderRadius: '8px',
              padding: '14px 16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.9rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {request.aiSummary || (
                <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                  Click "Summarize Thread" to distill this entire issue, comments, and action items into a clean 3-bullet executive summary.
                </span>
              )}
            </div>
          </div>

          {/* AI DRAFT REPLY GENERATOR (Required by 2.9 for Agents) */}
          {(isAgent || isAdmin) && (
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={18} color="#06b6d4" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    AI Contextual Draft Reply
                  </h3>
                </div>
                <button
                  onClick={handleGenerateDraft}
                  disabled={drafting}
                  className="btn btn-primary btn-sm"
                >
                  <Sparkles size={13} />
                  {drafting ? 'Drafting...' : 'Generate Draft Reply'}
                </button>
              </div>

              {request.suggestedDraftReply ? (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  position: 'relative'
                }}>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {request.suggestedDraftReply}
                  </p>
                  <button
                    onClick={() => copyToInput(request.suggestedDraftReply)}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    {copiedDraft ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    {copiedDraft ? 'Copied to Reply Box!' : 'Insert into Reply Box'}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Click "Generate Draft Reply" to generate an intelligent, context-aware response based on the ticket history and policies.
                </p>
              )}
            </div>
          )}

          {/* COMMENTS THREAD (Required by 2.9) */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <MessageSquare size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                Discussion Thread ({comments.length})
              </h3>
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.9rem' }}>
                  No messages yet. Send a message to start the conversation.
                </div>
              ) : (
                comments.map((c) => {
                  const isAuthorAgent = c.author?.role === 'agent' || c.author?.role === 'admin';
                  return (
                    <div
                      key={c._id || c.id}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        background: isAuthorAgent ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isAuthorAgent ? 'rgba(6, 182, 212, 0.2)' : 'var(--border-subtle)'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>
                            {c.author?.name || 'User'}
                          </span>
                          <RoleBadge role={c.author?.role} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {c.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Box */}
            <form onSubmit={handleAddComment}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Write a message, request clarification, or send an update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={commentSubmitting}
                >
                  <Send size={15} />
                  {commentSubmitting ? 'Posting...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ticket Meta, Assignee, SLA, Status Controls */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              Operational Controls
            </h3>

            {/* Status Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label">Ticket Status</label>
              <select
                className="form-select"
                value={request.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="pending">In Progress / Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* SLA countdown */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '14px', marginBottom: '18px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                SLA Compliance Clock
              </div>
              <SlaTimer deadline={request.slaDeadline} resolvedAt={request.resolvedAt} status={request.status} />
              {request.slaDeadline && (
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  Target: {new Date(request.slaDeadline).toLocaleString()}
                </div>
              )}
            </div>

            {/* Requester Info */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Submitted By
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                  {request.requester?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    {request.requester?.name || 'Employee'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {request.requester?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Specialist */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Assigned Specialist
              </div>
              {request.assignedTo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                    {request.assignedTo.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                      {request.assignedTo.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {request.assignedTo.department} Support
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  Unassigned
                </div>
              )}

              {(isAgent || isAdmin) && !request.assignedTo && (
                <button
                  onClick={handleAssignToMe}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Assign to Me
                </button>
              )}
            </div>

            {/* Quick Resolution Button */}
            {request.status !== 'resolved' && request.status !== 'closed' && (
              <button
                onClick={() => handleStatusChange('resolved')}
                className="btn btn-success"
                style={{ width: '100%', padding: '12px' }}
              >
                <CheckCircle size={16} /> Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
