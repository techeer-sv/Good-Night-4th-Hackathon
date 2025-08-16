import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
// import Footer from './Footer'; // 필요 시 추가 가능

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen relative">
      {/* Background Image - Full Screen */}
      <img 
        src="/movie.jpg"
        alt="Movie Theater Background"
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Sidebar */}
      <aside className="w-80 text-white fixed h-full left-0 top-0 z-20 bg-black/30 backdrop-blur-md border-r border-white/20">
        <Sidebar />
      </aside>

      {/* Login Button - Top Right (Full Screen Position) */}
      <div className="fixed top-4 right-16 z-50">
        <Navbar />
      </div>

      {/* Main Area */}
      <div className="flex flex-col flex-1 ml-80 relative z-10">
        {/* Main Content */}
        <main className="flex-1 p-6 pt-20">
          <div className="bg-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
