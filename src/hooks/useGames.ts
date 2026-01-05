import { useAppContext } from '../context/AppContext';

export const useGames = () => {
    const { games, addGame, updateGame, deleteGame } = useAppContext();
    return { games, addGame, updateGame, deleteGame };
};
