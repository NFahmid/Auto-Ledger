# Auto Ledger

Auto Ledger is a modern, full-stack accounting web application designed to help individuals, freelancers, and small businesses efficiently manage their finances. With a beautiful, intuitive interface and powerful features, Auto Ledger makes bookkeeping, budgeting, and financial tracking simple and accessible.

---

## ✨ Features

- **User Authentication**: Secure registration and login with JWT-based authentication.
- **Dashboard**: Visual overview of your financial health, including budget tracking and category summaries.
- **Double-Entry Transactions**: Add, view, and manage transactions using standard accounting principles (debit/credit).
- **AI Transaction Assist**: Describe a transaction in plain language and let the AI suggest the correct accounts.
- **Category Management**: Create, edit, and delete custom categories for precise financial organization.
- **Budgeting Tools**: Set monthly budgets per category and track actual vs. budgeted spending.
- **Responsive UI**: Works beautifully on desktop and mobile, with a modern, animated design.
- **Secure Backend**: Node.js/Express server with Prisma ORM and PostgreSQL (or SQLite) database.
- **Role-based Navigation**: Navbar adapts to user state, with smooth transitions and active page indicators.
- **Error Handling & Feedback**: Friendly error messages, success notifications, and form validation throughout.

---

## 👤 Who is this app for?

- **Freelancers & Contractors**: Track income, expenses, and budgets for your business or side hustle.
- **Small Business Owners**: Manage company finances, categorize transactions, and monitor budgets.
- **Individuals**: Take control of your personal finances, set spending goals, and analyze your habits.
- **Students & Learners**: Learn double-entry accounting in a hands-on, interactive way.

No prior accounting experience required! The app is designed to be approachable for beginners, yet powerful enough for advanced users.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/auto-ledger.git
cd Auto-Ledger
```

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client/auto-ledger-frontend
npm install
```

### 3. Set Up the Database

- Configure your database connection in `server/prisma/schema.prisma` (default is SQLite, but you can use PostgreSQL).
- Run migrations and seed data:

```bash
cd ../../server
npx prisma migrate deploy
npx prisma db seed
```

### 4. Start the Servers

#### Backend
```bash
cd server
npm start
```

#### Frontend
```bash
cd ../client/auto-ledger-frontend
npm run dev
```

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## 🧑‍💻 How to Use

1. **Register** for a new account or log in.
2. **Add Categories** to organize your transactions.
3. **Set Budgets** for each category to track your spending goals.
4. **Add Transactions** using the double-entry form, or use the AI Assist to describe your transaction in plain language.
5. **View Dashboard** for a summary of your budgets, spending, and category breakdowns.
6. **Edit or Delete** categories, budgets, and transactions as needed.
7. **Log out** securely when finished.

---

## 🛠️ Technologies Used

- **Frontend**: Next.js 13+, React, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: Prisma ORM (supports SQLite, PostgreSQL, MySQL)
- **Authentication**: JWT (JSON Web Tokens)
- **AI Assist**: (Optional) Integrates with OpenAI or similar for transaction suggestions
- **UI/UX**: Modern, responsive design with smooth animations and gradients

---

## 📂 Project Structure

```
Auto-Ledger/
  client/
    auto-ledger-frontend/   # Next.js frontend
  server/                   # Node.js/Express backend
    prisma/                 # Prisma schema and migrations
```

---

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or improvements.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- Inspired by best practices in modern accounting software
- UI/UX inspired by leading SaaS finance tools

---

**Auto Ledger** – Your finances, made simple. 