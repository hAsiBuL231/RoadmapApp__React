import { useState } from "react";
import "./CommentItem.css";

function CommentItem({ comment, currentUser, onEdit, onDelete, onReply }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwner = currentUser?.id === comment.user?.id;
  const hasReplies = comment.replies?.length > 0;

  const handleSaveEdit = () => {
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const handleSubmitReply = () => {
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReply(false);
  };

  return (
    <div className={`comment ${comment.depth > 0 ? "is-reply" : ""}`}>
      <div className="comment-header">
        <div className="comment-author">
          <img 
            src={comment.user?.avatar || "/default-avatar.png"} 
            alt={comment.user?.name} 
            className="avatar"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
          <div>
            <span className="author-name">{comment.user?.name}</span>
            <span className="comment-time">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        
        {isOwner && !isEditing && (
          <div className="comment-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(comment.id)}>Delete</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="edit-actions">
            <button onClick={() => setIsEditing(false)}>Cancel</button>
            <button 
              onClick={handleSaveEdit}
              disabled={!editText.trim() || editText === comment.text}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="comment-content">
          <p>{comment.text}</p>
        </div>
      )}

      <div className="comment-footer">
        <button onClick={() => setShowReply(!showReply)}>
          {showReply ? "Cancel Reply" : "Reply"}
        </button>
        {hasReplies && (
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Hide Replies" : `Show Replies (${comment.replies.length})`}
          </button>
        )}
      </div>

      {showReply && (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            maxLength={500}
            rows={3}
          />
          <div className="reply-actions">
            <span>{replyText.length}/500</span>
            <button 
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {hasReplies && isExpanded && (
        <div className="replies-list">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;