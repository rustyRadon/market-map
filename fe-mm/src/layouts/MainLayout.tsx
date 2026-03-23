import SideBar from './SideBar.tsx';
import TopBar from './TopBar.tsx';
import { useThemeStore } from '../store/useThemeStore.ts';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isDark } = useThemeStore();

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors ${isDark ? 'bg-[#0a0a0c]' : 'bg-white'}`}>
      <SideBar isDark={isDark} />

      <div className="flex flex-col flex-1 min-w-0">
        <header className={`h-16 flex-shrink-0 ${isDark ? 'border-b border-slate-800 bg-[#0f0f12]' : 'border-b border-slate-200 bg-white'}`}>
          <TopBar />
        </header>
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${isDark ? '' : 'bg-white'}`}>
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;