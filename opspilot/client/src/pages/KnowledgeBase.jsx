import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DepartmentBadge } from '../components/Badges';
import { SkeletonCard } from '../components/Skeleton';
import { ErrorState, EmptyState } from '../components/FeedbackStates';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Tag, 
  X, 
  Save, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export const KnowledgeBase = () => {
  const { isAgent, isAdmin } = useAuth();
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  
  // Modals
  const [viewArticle, setViewArticle] = useState(null);
  const [editArticle, setEditArticle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'IT',
    category: 'General',
    tags: '',
    content: ''
  });

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        search,
        department: selectedDept
      }).toString();
      const res = await api.getArticles(params);
      setArticles(res.articles || []);
    } catch (err) {
      console.error('Failed to load KB articles:', err);
      setError(err.message || 'Unable to load knowledge base articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      department: 'IT',
      category: 'General',
      tags: '',
      content: ''
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (article) => {
    setEditArticle(article);
    setFormData({
      title: article.title,
      department: article.department,
      category: article.category,
      tags: (article.tags || []).join(', '),
      content: article.content
    });
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        content: formData.content
      };

      if (editArticle) {
        await api.updateArticle(editArticle._id || editArticle.id, payload);
      } else {
        await api.createArticle(payload);
      }

      toast.success('✓ Article saved');
      setIsCreating(false);
      setEditArticle(null);
      fetchArticles();
    } catch (err) {
      console.error('Save article failed:', err);
      toast.error('✕ Something went wrong');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge article?')) return;
    try {
      await api.deleteArticle(id);
      toast.success('✓ Article saved');
      fetchArticles();
      if (viewArticle && (viewArticle._id === id || viewArticle.id === id)) {
        setViewArticle(null);
      }
    } catch (err) {
      console.error('Delete article failed:', err);
      toast.error('✕ Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <BookOpen size={16} />
            <span>Autonomous Enterprise RAG Source</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff' }}>Knowledge Base</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Verified enterprise policies and runbooks powering instant AI deflection answers
          </p>
        </div>

        {(isAgent || isAdmin) && (
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} /> Create Article
          </button>
        )}
      </div>

      {/* Search & Department Filter */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search across guides, runbooks, VPN, PTO, policies..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="IT">IT Support</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Facilities">Facilities</option>
            <option value="Procurement">Procurement</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Unable to load articles."
          message={error}
          onRetry={fetchArticles}
        />
      )}

      {/* Articles Grid / Loading / Empty */}
      {!error && loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} lines={4} />
          ))}
        </div>
      ) : !error && articles.length === 0 ? (
        <EmptyState
          title="No articles found."
          message="Try broadening your search term or select All Departments."
          actionText={isAgent || isAdmin ? "Create your first article →" : undefined}
          onAction={isAgent || isAdmin ? handleOpenCreate : undefined}
        />
      ) : !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {articles.map((art) => (
            <div
              key={art._id || art.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setViewArticle(art)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <DepartmentBadge department={art.department} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={12} /> {art.viewCount || 0} views
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                  {art.title}
                </h3>

                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {art.content}
                </p>
              </div>

              <div>
                {/* Tags */}
                {art.tags && art.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {art.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: '#64748b' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                    Read Guide →
                  </span>

                  {(isAgent || isAdmin) && (
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Article"
                        style={{ padding: '4px 8px' }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art._id || art.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Article"
                        style={{ padding: '4px 8px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW ARTICLE MODAL */}
      {viewArticle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="glass-panel-glow" style={{
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <DepartmentBadge department={viewArticle.department} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                  {viewArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setViewArticle(null)}
                className="btn btn-secondary btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap'
            }}>
              {viewArticle.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Viewed {viewArticle.viewCount || 0} times
              </div>
              <button onClick={() => setViewArticle(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ARTICLE MODAL */}
      {(isCreating || editArticle) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {editArticle ? 'Edit Knowledge Article' : 'Create Knowledge Article'}
              </h2>
              <button
                onClick={() => { setIsCreating(false); setEditArticle(null); }}
                className="btn btn-secondary btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveArticle}>
              <div className="form-group">
                <label className="form-label">Article Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Cisco AnyConnect VPN Setup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="IT">IT Support</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Procurement">Procurement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. VPN or Leave"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="vpn, security, cisco, remote"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Article Content & Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  required
                  placeholder="Enter detailed step-by-step instructions..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditArticle(null); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
