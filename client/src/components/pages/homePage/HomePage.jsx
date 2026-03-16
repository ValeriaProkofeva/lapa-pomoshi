import { useState, useEffect } from 'react';
import Advertisements from './advertisements/Advertisements';
import AuthModal from '../../modals/AuthModal';
import Header from '../../header/Header';
import Profile from '../../profile/Profile';
import AdminPanel from '../../admin/AdminPanel';
import VolunteerPage from '../volunteer/VolunteerPage';
import HelpPage from '../../help/HelpPage';
import Footer from '../../footer/Footer';
import CreateAdModal from './advertisements/CreateAdModal';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isVolunteerPageOpen, setIsVolunteerPageOpen] = useState(false);
  const [isHelpPageOpen, setIsHelpPageOpen] = useState(false);
  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  

  useEffect(() => {
    checkAuth();
  }, []);


  const handleHome = () => {
    setIsProfileOpen(false);
    setIsAdminPanelOpen(false);
    setIsVolunteerPageOpen(false);
    setIsHelpPageOpen(false);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.authenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    }
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
    setIsProfileOpen(false);
    setIsAdminPanelOpen(false);
    setIsVolunteerPageOpen(false);
    setIsHelpPageOpen(false);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuth = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
     const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        setIsProfileOpen(false);
        setIsAdminPanelOpen(false);
        setIsVolunteerPageOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const handleCreateAd = () => {
    if (!user) {
      setIsAuthModalOpen(true); // Если не авторизован, открываем окно входа
    } else {
      setIsCreateAdModalOpen(true); // Если авторизован, открываем модалку создания объявления
    }
  };

  const handleCloseCreateAd = () => {
    setIsCreateAdModalOpen(false);
  };

  const handleAdCreated = () => {
    // Если мы на странице объявлений, перезагружаем их
    if (!isProfileOpen && !isAdminPanelOpen && !isVolunteerPageOpen && !isHelpPageOpen) {
      window.dispatchEvent(new CustomEvent('refreshAdvertisements'));
    }
  };

  const handleRequireAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
    setIsAdminPanelOpen(false);
    setIsVolunteerPageOpen(false);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleOpenAdminPanel = () => {
    setIsAdminPanelOpen(true);
    setIsProfileOpen(false);
    setIsVolunteerPageOpen(false);
  };

  const handleCloseAdminPanel = () => {
    setIsAdminPanelOpen(false);
  };

  const handleOpenVolunteer = () => {
    setIsVolunteerPageOpen(true);
    setIsProfileOpen(false);
    setIsAdminPanelOpen(false);
  };

  const handleCloseVolunteer = () => {
    setIsVolunteerPageOpen(false);
  };

  const handleOpenHelp = () => {
    setIsHelpPageOpen(true);
    setIsProfileOpen(false);
    setIsAdminPanelOpen(false);
    setIsVolunteerPageOpen(false);
  };

  const handleCloseHelp = () => {
    setIsHelpPageOpen(false);
  };

  return (
    <>
      <title>Лапа Помощи</title>
      <Header
        onOpenAuth={handleOpenAuth}
        user={user}
        onCreateAd={handleCreateAd}
        onOpenProfile={handleOpenProfile}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenVolunteer={handleOpenVolunteer}
        onOpenHelp={handleOpenHelp}
        onLogout={handleLogout}
        onHome={handleHome}
      />

      {isAdminPanelOpen ? (
        <AdminPanel
          user={user}
          onClose={handleCloseAdminPanel}
          onLogout={handleLogout}
        />
      ) : isProfileOpen ? (
        <Profile
          user={user}
          onLogout={handleLogout}
          onClose={handleCloseProfile}
        />
      ) : isVolunteerPageOpen ? (
        <VolunteerPage
          user={user}
          onOpenAuth={handleOpenAuth}
          onClose={handleCloseVolunteer}
        />
      ) : isHelpPageOpen ? (
        <HelpPage
          onClose={handleCloseHelp}
        />
      ) : (
        <Advertisements
          user={user}
          onRequireAuth={handleRequireAuth}
        />
      )}

      <Footer
        onOpenHelp={handleOpenHelp}
        onOpenVolunteer={handleOpenVolunteer}
        onOpenAuth={handleOpenAuth}
        onHome={handleHome}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        onAuth={handleAuth}
      />

      <CreateAdModal
        isOpen={isCreateAdModalOpen}
        onClose={handleCloseCreateAd}
        user={user}
        onAdCreated={handleAdCreated}
      />
    </>
  );
}

export default HomePage;