import { useEffect, useState } from 'react';
import Header from '../src/components/Header/Header';
import NavbarTop from '../src/components/NavbarTop/NavbarTop';
import Lending from '../src/processes/MainPageWay/Lending/Lending';
import PrimeWishes from '../src/processes/MainPageWay/PrimeWishes/PrimeWishes';
import BoardGames from '../src/processes/MainPageWay/BoardGames/BoardGames';
import Books from '../src/processes/MainPageWay/Books/Books';
import Other from '../src/processes/MainPageWay/Other/Other';
import MyLists from '../src/processes/MainPageWay/MyLists/MyLists';
import AuthModal from '../src/components/Modals/AuthForm/AuthModal';
import { useSession } from '../src/lib/session';

const MY_LISTS_BLOCK = 6;

export default function MainPage() {
  const { isAuthenticated } = useSession();
  const [selectedBlock, setSelectedBlock] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && selectedBlock === MY_LISTS_BLOCK) {
      setSelectedBlock(1);
    }
  }, [isAuthenticated, selectedBlock]);

  const openSection = () => {
    if (isAuthenticated) setSelectedBlock(MY_LISTS_BLOCK);
    else setAuthOpen(true);
  };

  const renderSelectedBlock = () => {
    switch (selectedBlock) {
      case 1:
        return <Lending onExplore={() => setSelectedBlock(2)} />;
      case 2:
        return <PrimeWishes />;
      case 3:
        return <BoardGames onRequestAuth={() => setAuthOpen(true)} />;
      case 4:
        return <Books onOpen={openSection} />;
      case 5:
        return <Other onOpen={openSection} />;
      case MY_LISTS_BLOCK:
        return <MyLists onRequestAuth={() => setAuthOpen(true)} />;
      default:
        return <Lending onExplore={() => setSelectedBlock(2)} />;
    }
  };

  return (
    <div>
      <Header onRequestAuth={() => setAuthOpen(true)} />
      <NavbarTop
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        showMyLists={isAuthenticated}
      />
      <main>{renderSelectedBlock()}</main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onDone={() => setSelectedBlock(MY_LISTS_BLOCK)} />
    </div>
  );
}
