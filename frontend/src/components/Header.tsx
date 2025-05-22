"use client";
interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center bg-white p-4 shadow">
      <button
        onClick={toggleSidebar}
        className="mr-4 text-purple-800 focus:outline-none"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <h1 className="text-xl font-semibold text-purple-800">Admin Dashboard</h1>
    </header>
  );
};

export default Header;
