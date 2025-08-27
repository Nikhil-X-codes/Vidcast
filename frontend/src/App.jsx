
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './context/Authcontext';
import { ThemeProvider } from './context/Toggle';

const SignInPage = lazy(() => import('./pages/Signin'));
const LoginPage = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const History = lazy(() => import('./pages/History'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const VideoManager = lazy(() => import('./pages/VideoManager'));
const PlaylistManager = lazy(() => import('./components/PlaylistManager'));
const Like = lazy(() => import('./components/Like'));
const SubscriptionStats = lazy(() => import('./components/SubscriptionStats'));
const SearchComponent = lazy(() => import('./pages/Search'));
const SearchVideoPlayer = lazy(() => import('./pages/searchvideo'));

const App = () => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) return;
    // Warm up backend to avoid cold starts (Render free tier)
    const warmUrl = baseUrl.replace(/\/$/, '');
    fetch(warmUrl, { method: 'GET', credentials: 'omit', cache: 'no-store' }).catch(() => {});
    const id = setInterval(() => {
      fetch(warmUrl, { method: 'GET', credentials: 'omit', cache: 'no-store' }).catch(() => {});
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <Routes>
      
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/signup" element={<SignInPage />} />
          <Route path="/login" element={<LoginPage />} />
          
         <Route
  path="/home/*"
  element={
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Home />
      </div>
    </div>
  }
/>
          <Route
            path="/subscription"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <SubscriptionStats />
                </div>
              </div>
            }
          />
 <Route
          path="/playlist"
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <PlaylistManager />
              </div>
            </div>
          }
        />

        <Route
          path="/playlist/:playlistId"
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <PlaylistManager />
              </div>
            </div>
          }
        />
          
          <Route
            path="/my-video"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <VideoManager />
                </div>
              </div>
            }
          />


          <Route
            path="/history"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <History />
                </div>
              </div>
            }
          />
          

          <Route
            path="/liked-videos"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                 <Like />
                </div>
              </div>
            }
          />
        
  <Route path="/search" element={
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <SearchComponent />
      </div>
    </div>
  } />
  
  <Route path="/search/:videoId" element={
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <SearchVideoPlayer />
      </div>
    </div>
  } />

        </Routes>
        </Suspense>
      </Router>
      
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
