# 🚀 Roadmap App

A collaborative roadmap platform where users can upvote predefined product milestones, leave feedback, and engage in threaded discussions.

---

## 🧩 Features

- **Authentication:** Secure email/password login and signup using JWT
- **Roadmap Viewer:** Predefined items with filtering by status
- **Upvotes:** Users can upvote an item once to express support
- **Comments & Replies:** 3-level nested discussions with edit/delete support
- **Responsive UI:** Custom-designed interface using raw CSS, fully responsive
- **Access Control:** Only authenticated users can upvote or participate in discussions

---

## ⚙️ Technology Stack

**Frontend:**
- React (functional components, hooks)
- Axios (API communication)
- React Router DOM (navigation)

**Backend:**
- Flask + Flask-JWT-Extended (auth)
- Flask-SQLAlchemy (ORM)
- SQLite (development DB, easy migration-ready)
- CORS, Bcrypt (security)

**Other:**
- Raw CSS (responsive, clean design)
- Git & GitHub for version control and deployment

---

## 🧠 Project Design Decisions

- **Stack Choice:** React and Flask were chosen for their rapid development capability, modular structure, and flexibility.
- **Data Model:** RoadmapItem, User, Comment, Reply, and Upvote tables—normalized for scalability.
- **Comment Threads:** Implemented recursive rendering in React with a 3-level nesting limit for simplicity and performance.
- **One-Upvote Logic:** Enforced with a database-level uniqueness constraint between user and roadmap item.

---

## 🧪 Getting Started

### Backend
```bash
cd roadmap-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd roadmap-app
npm install
npm start
```

---

## 📁 Project Structure

```
├── roadmap-backend/
│   ├── app.py
│   └── ...
├── roadmap-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── comments_&_reply/
│   │   │   ├── roadmap/
│   │   ├── components/
│   │   └── utils/
│   └── public/
```

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create.
Pull requests are welcome.

#### How to Contribute:
1. Fork the repo
2. Create your feature branch (git checkout -b feature/your-feature)
3. Commit your changes (git commit -m 'Add your feature')
4. Push to the branch (git push origin feature/your-feature)
5. Open a Pull Request

## 🐛 Issues & Support

If you encounter bugs or have feature suggestions, please use the [Issues tab](https://github.com/your-username/womens-safety-app/issues).

----------

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

----------

## 👨‍💻 Author

**MD Hasibul Hossain**  
Dept. of Computer Science & Engineering  
Comilla University
