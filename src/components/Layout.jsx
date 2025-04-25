import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-[#f5fbff]">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
