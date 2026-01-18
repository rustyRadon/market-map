import SideBar from './SideBar.tsx';
import TopBar from './TopBar.tsx';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden">
      <SideBar />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 border-b border-slate-800 bg-[#0f0f12] flex-shrink-0">
          <TopBar />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;