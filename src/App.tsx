import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { DiscoveryFeed } from './modules/discovery/DiscoveryFeed';
import { AICreator } from './modules/creator/AICreator';
import { Profile } from './modules/profile/Profile';
import { Explore, Following, Friends, Live } from './modules/placeholder/PlaceholderPages';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DiscoveryFeed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/following" element={<Following />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/live" element={<Live />} />
        <Route path="/create" element={<AICreator />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
