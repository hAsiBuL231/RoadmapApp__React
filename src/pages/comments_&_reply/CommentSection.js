import { useState, useEffect } from "react";
import { commentService, replyService } from "../../utils/apiService";
import CommentItem from "./CommentItem";
import "./CommentSection.css";

function CommentSection({ itemId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState({
    comments: false,
    posting: false
  });
  const [error, setError] = useState(null);
  const [replyingStates, setReplyingStates] = useState({});

  const fetchComments = async () => {
    setIsLoading(prev => ({ ...prev, comments: true }));
    setError(null);
    try {
      const comments = await commentService.getByItem(itemId);
      console.log("Fetched comments:", comments);
      setComments(comments);
    } catch (err) {
      setError("Failed to load comments. Please try again.");
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(prev => ({ ...prev, posting: true }));
    try {
      const comment = await commentService.create(itemId, newComment);
      setNewComment("");
      setComments(prev => [comment, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post comment. Please try again.");
      console.error("Error posting comment:", err);
    } finally {
      setIsLoading(prev => ({ ...prev, posting: false }));
    }
  };

  const handleEditComment = async (commentId, text, parentId = null) => {
    try {
      const updatedComment = await commentService.update(commentId, text);
      console.log("Updated comment:", updatedComment);
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update comment. Please try again.");
      console.error("Error editing comment:", err);
    }
  };

  const handleDeleteComment = async (commentId, parentId = null) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentService.delete(commentId);
      setComments(prev => {
        if (parentId) {
          return prev.map(comment =>
            comment.id === parentId
              ? {
                ...comment,
                replies: comment.replies.filter(r => r.id !== commentId)
              }
              : comment
          );
        } else {
          return prev.filter(comment => comment.id !== commentId);
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete comment. Please try again.");
      console.error("Error deleting comment:", err);
    }
  };

  const handleReply = async (parentId, text, depth = 1) => {
    setReplyingStates(prev => ({ ...prev, [parentId]: true }));
    try {
      const reply = await replyService.create(parentId, text, depth);

      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? {
              ...comment,
              replies: [...(comment.replies || []), reply]
            }
            : comment
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post reply. Please try again.");
      console.error("Error posting reply:", err);
    } finally {
      setReplyingStates(prev => ({ ...prev, [parentId]: false }));
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  return (
    <section className="comment-section">
      <header className="comment-section-header">
        <h2 className="comment-section-title">Discussion ({comments.length})</h2>
        {error && <div className="comment-error">{error}</div>}
      </header>

      {currentUser && (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-form-group">
            <textarea
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={500}
              rows={3}
              aria-label="Write a comment"
              disabled={isLoading.posting}
            />
            <div className="comment-form-footer">
              <span className="character-count">{newComment.length}/500</span>
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
      )}

      {isLoading.comments && comments.length === 0 ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="empty-state">
          <p>No comments yet. {currentUser ? "Be the first to share your thoughts!" : "Log in to leave a comment."}</p>
        </div>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleReply}
              isReplying={replyingStates[comment.id] || false}
              depth={0}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default CommentSection;