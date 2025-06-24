import { useEffect, useState } from "react";
import CommentSection from "../comments_&_reply/CommentSection";
import "./Roadmap.css";
import { roadmapService, authService } from "../../utils/apiService";

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null); // Add currentUser state


  useEffect(() => {
    const userData = localStorage.getItem("userInfo");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);


  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      try {
        const items = await roadmapService.getAllItems(filter, searchTerm);
        setRoadmap(items);
      } catch (error) {
        console.error("Failed to fetch roadmap items", error);
        alert("Failed to load roadmap items. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, [filter, searchTerm]);


  const handleUpvote = async (itemId) => {
    try {
      await roadmapService.upvoteItem(itemId);
      setRoadmap(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, upvotes: item.upvotes + 1, hasUpvoted: true } : item
        )
      );
    } catch (error) {
      if (error.response?.status === 400) {
        alert("You've already voted for this item.");
      } else if (error.response?.status === 401) {
        alert("Please log in to vote.");
      } else if (error.response?.status === 404) {
        alert("Item not found.");
      } else {
        alert("Upvote failed. Please try again.");
      }
    }
  };


  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      authService.logout();
      setTimeout(() => window.location.href = "/login", 100);
    }
  };


  const filteredItems = roadmap.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusCounts = roadmap.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { "all": roadmap.length });

  return (
    <div className="roadmap-container">
      <header className="roadmap-header">
        <div className="header-wrapper">
          {currentUser && (
            <div className="user-controls">
              <span className="welcome-message">Welcome, {currentUser.email.split("@")[0]}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}

          <div className="header-content">
            <h1>Product Roadmap</h1>
            <p>Track upcoming features and improvements</p>
          </div>
        </div>


        <div className="roadmap-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="status-tabs">
            {["all", "planned", "in-progress", "completed"].map(status => (
              <button
                key={status}
                className={`tab-btn ${activeTab === status ? 'active' : ''}`}
                onClick={() => setActiveTab(status)}
              >
                {status.replace("-", " ")} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading roadmap items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>No items found matching your criteria.</p>
          <button onClick={() => { setSearchTerm(""); setActiveTab("all"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="roadmap-items">
          {filteredItems.map((item) => (
            <div key={item.id} className={`card status-${item.status}`}>
              <div className="card-header">
                <span className={`status-badge ${item.status}`}>
                  {item.status.replace("-", " ")}
                </span>
                <h3>{item.title}</h3>
              </div>

              {item.description && <p className="card-description">{item.description}</p>}

              <div className="card-footer">
                <div className="upvote-section">
                  <button
                    onClick={() => handleUpvote(item.id)}
                    disabled={item.hasUpvoted}
                    className={`upvote-btn ${item.hasUpvoted ? 'upvoted' : ''}`}
                  >
                    ▲ Upvote {item.upvotes > 0 && <span>({item.upvotes})</span>}
                  </button>
                </div>

                <div className="meta-info">
                  {item.createdAt && <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>}
                </div>
              </div>

              <CommentSection itemId={item.id} currentUser={localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Roadmap;