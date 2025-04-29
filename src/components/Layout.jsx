// src/components/Layout.jsx
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
