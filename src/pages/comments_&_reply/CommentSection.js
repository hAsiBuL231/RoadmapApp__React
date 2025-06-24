import { useState, useEffect } from "react";
import API from "../../utils/api";
import "./CommentSection.css";

function CommentSection({ itemId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState({
    comments: false,
    posting: false,
    editing: null,
    replying: null,
    deleting: null
  });
  const [error, setError] = useState(null);
  const [activeReplyId, setActiveReplyId] = useState(null);

  const fetchComments = async () => {
    setIsLoading(prev => ({...prev, comments: true}));
    setError(null);
    try {
      const res = await API.get(`/comments/${itemId}`);
      setComments(res.data);
    } catch (err) {
      setError("Failed to load comments. Please try again.");
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(prev => ({...prev, comments: false}));
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsLoading(prev => ({...prev, posting: true}));
    try {
      await API.post("/comments", {
        item_id: itemId,
        text: newComment,
        user_id: currentUser?.id
      });
      setNewComment("");
      await fetchComments();
    } catch (err) {
      setError("Failed to post comment. Please try again.");
      console.error("Error posting comment:", err);
    } finally {
      setIsLoading(prev => ({...prev, posting: false}));
    }
  };

  const handleEditComment = async (commentId, text) => {
    if (!text.trim()) return;
    
    setIsLoading(prev => ({...prev, editing: commentId}));
    try {
      await API.put(`/comments/${commentId}`, { text });
      await fetchComments();
    } catch (err) {
      setError("Failed to update comment. Please try again.");
      console.error("Error editing comment:", err);
    } finally {
      setIsLoading(prev => ({...prev, editing: null}));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    setIsLoading(prev => ({...prev, deleting: commentId}));
    try {
      await API.delete(`/comments/${commentId}`);
      await fetchComments();
    } catch (err) {
      setError("Failed to delete comment. Please try again.");
      console.error("Error deleting comment:", err);
    } finally {
      setIsLoading(prev => ({...prev, deleting: null}));
    }
  };

  const handleReply = async (commentId, text) => {
    if (!text.trim()) return;
    
    setIsLoading(prev => ({...prev, replying: commentId}));
    try {
      await API.post("/replies", {
        comment_id: commentId,
        text,
        user_id: currentUser?.id
      });
      setActiveReplyId(null);
      await fetchComments();
    } catch (err) {
      setError("Failed to post reply. Please try again.");
      console.error("Error posting reply:", err);
    } finally {
      setIsLoading(prev => ({...prev, replying: null}));
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  return (
    <section className="comment-section">
      <header className="comment-section-header">
        <h2 className="comment-section-title">
          Discussion ({comments.length})
        </h2>
        {error && <div className="comment-error">{error}</div>}
      </header>

      <form className="comment-form" onSubmit={handleSubmitComment}>
        <div className="comment-form-group">
          <textarea
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={500}
            rows={4}
            aria-label="Write a comment"
            disabled={isLoading.posting}
          />
          <div className="comment-form-footer">
            <span className="character-count">
              {newComment.length}/500
            </span>
            <button
              type="submit"
              className="submit-button"
              disabled={!newComment.trim() || isLoading.posting}
            >
              {isLoading.posting ? (
                <span className="loading-dots">Posting</span>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </div>
      </form>

      {isLoading.comments && comments.length === 0 ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="empty-state">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              isEditing={isLoading.editing === comment.id}
              isReplying={isLoading.replying === comment.id}
              isDeleting={isLoading.deleting === comment.id}
              activeReplyId={activeReplyId}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleReply}
              setActiveReplyId={setActiveReplyId}
              depth={0}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  currentUser,
  isEditing,
  isReplying,
  isDeleting,
  activeReplyId,
  onEdit,
  onDelete,
  onReply,
  setActiveReplyId,
  depth
}) {
  const [editText, setEditText] = useState(comment.text);
  const [replyText, setReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSaveEdit = () => {
    onEdit(comment.id, editText);
  };

  const handleCancelEdit = () => {
    setEditText(comment.text);
  };

  const handleSubmitReply = () => {
    onReply(comment.id, replyText);
    setReplyText("");
  };

  const isOwner = currentUser?.id === comment.user?.id;
  const hasReplies = comment.replies?.length > 0;

  return (
    <li className={`comment ${depth > 0 ? "is-reply" : ""}`}>
      <article className="comment-card">
        <header className="comment-header">
          <div className="comment-author">
            <img
              src={comment.user?.avatar || "/default-avatar.png"}
              alt={comment.user?.name}
              className="comment-avatar"
            />
            <div>
              <h3 className="comment-author-name">
                {comment.user?.name || "Anonymous"}
              </h3>
              <time className="comment-time">
                {new Date(comment.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </time>
            </div>
          </div>
          
          {isOwner && (
            <div className="comment-actions">
              <button
                className="action-button edit-button"
                onClick={() => setEditText(comment.text)}
                aria-label="Edit comment"
              >
                Edit
              </button>
              <button
                className="action-button delete-button"
                onClick={() => onDelete(comment.id)}
                aria-label="Delete comment"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </header>

        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={500}
              rows={3}
              aria-label="Edit comment"
            />
            <div className="edit-actions">
              <button
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                className="save-button"
                onClick={handleSaveEdit}
                disabled={!editText.trim() || editText === comment.text || isEditing}
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-content">
            <p>{comment.text}</p>
          </div>
        )}

        <footer className="comment-footer">
          <button
            className="reply-button"
            onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
            disabled={isEditing}
          >
            {activeReplyId === comment.id ? "Cancel Reply" : "Reply"}
          </button>
          
          {hasReplies && (
            <button
              className="toggle-replies-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Replies" : `Show Replies (${comment.replies.length})`}
            </button>
          )}
        </footer>

        {activeReplyId === comment.id && (
          <div className="reply-form">
            <textarea
              className="reply-input"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              maxLength={500}
              rows={3}
              aria-label="Write a reply"
              disabled={isReplying}
            />
            <div className="reply-actions">
              <span className="character-count">
                {replyText.length}/500
              </span>
              <button
                className="submit-reply-button"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || isReplying}
              >
                {isReplying ? (
                  <span className="loading-dots">Posting</span>
                ) : (
                  "Post Reply"
                )}
              </button>
            </div>
          </div>
        )}
      </article>

      {hasReplies && isExpanded && (
        <ul className="replies-list">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              isEditing={isEditing}
              isReplying={isReplying}
              isDeleting={isDeleting}
              activeReplyId={activeReplyId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              setActiveReplyId={setActiveReplyId}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default CommentSection;