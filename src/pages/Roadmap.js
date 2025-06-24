import { useEffect, useState } from "react";
import API from "../utils/api";
import CommentSection from "./comments_&_reply/CommentSection";
import "./Roadmap.css";

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      try {
        const response = await API.get("/roadmap");
        setRoadmap(response.data);
      } catch (error) {
        console.error("Failed to fetch roadmap items", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const handleUpvote = async (itemId) => {
    try {
      await API.post(`/upvote/${itemId}`, {});
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
        alert("Upvote failed. Try again.");
      }
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
        <h1>Product Roadmap</h1>
        <p>Track upcoming features and improvements</p>

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

              <CommentSection itemId={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Roadmap;