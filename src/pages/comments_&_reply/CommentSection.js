import { useState, useEffect } from "react";
import API from "../../utils/api";
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
      const res = await API.get(`/comments/${itemId}`);
      // Ensure each comment has a replies array
      const commentsWithReplies = res.data.map(comment => ({
        ...comment,
        replies: comment.replies || []
      }));
      setComments(commentsWithReplies);
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
      const response = await API.post("/comment", {
        item_id: itemId,
        text: newComment,
        user_id: currentUser?.id
      });
      setNewComment("");
      setComments(prev => [response.data, ...prev]);
    } catch (err) {
      setError("Failed to post comment. Please try again.");
      console.error("Error posting comment:", err);
    } finally {
      setIsLoading(prev => ({ ...prev, posting: false }));
    }
  };

  const handleEditComment = async (commentId, text, parentId = null) => {
    try {
      const updatedComment = await API.put(`/comments/${commentId}`, { text });

      setComments(prev => {
        if (parentId) {
          return prev.map(comment =>
            comment.id === parentId
              ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId ? updatedComment.data : reply
                )
              }
              : comment
          );
        } else {
          return prev.map(comment =>
            comment.id === commentId ? updatedComment.data : comment
          );
        }
      });
    } catch (err) {
      setError("Failed to update comment. Please try again.");
      console.error("Error editing comment:", err);
    }
  };

  const handleDeleteComment = async (commentId, parentId = null) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await API.delete(`/comments/${commentId}`);
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
      setError("Failed to delete comment. Please try again.");
      console.error("Error deleting comment:", err);
    }
  };

  const handleReply = async (parentId, text) => {
    setReplyingStates(prev => ({ ...prev, [parentId]: true }));
    try {
      const response = await API.post("/reply", {
        parent_id: parentId,
        text,
        user_id: currentUser?.id
      });

      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? {
              ...comment,
              replies: [...(comment.replies || []), response.data]
            }
            : comment
        )
      );
    } catch (err) {
      setError("Failed to post reply. Please try again.");
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