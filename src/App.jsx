import  { useEffect, useState, React } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import Card from './components/Card.jsx'
import { useDebounce } from 'react-use';
import { getTrendingAnimes, updateSearchCount } from './appwrite.js';

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [animeList, setAnimeList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingAnimes, setTrendingAnimes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  useDebounce( ()=> setDebouncedSearchTerm(searchTerm), 1000, [searchTerm])
  

  // Fonction pour charger les animés AVEC un délai anti-rate-limiting
  const fetchAnimes = async (page, query= '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const endpoint = query
       ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`
       : `https://api.jikan.moe/v4/anime?page=${page}`

      const response = await fetch(endpoint);
      if (!response.ok){
        throw new Error('Failed to fetch animes');
      }
      const data = await response.json();

      if (!data || !data.data || !Array.isArray(data.data)) {
        setHasNextPage(false);
        setErrorMessage('No anime data found');
        return;
      }

      setAnimeList(prev => [...prev, ...data.data]);
      if(query && data.data.length > 0){
        await updateSearchCount(query, data.data[0]);
      }
      setHasNextPage(data.pagination.has_next_page);
    } catch (error) {
      setErrorMessage("Error, try later");
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingAnimes = async () => {
    try{
      const Animes = await getTrendingAnimes();
      setTrendingAnimes(Animes);
    }catch(error) {
      console.log(error);
    }
  }
  // Bouton "Load More"
  const loadMore = () => {
    if (hasNextPage) {
      fetchAnimes(currentPage + 1);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Chargement initial
  useEffect(() => {
    setAnimeList([]);
    fetchAnimes(1, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(()=> {
    loadTrendingAnimes();
  }, []);

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            
            <h1><img src="./fire.png" alt="" className='w-20 h-20' />Hot <span className="bg-gradient-to-r from-blue-400 to-indigo-800 bg-clip-text text-transparent">Animes</span> You Should Be Watching </h1>
            <img src="./image.png" alt="Hero" className='rounded-full mt-10 w-80 h-80' />
            
            
          </header>
          {trendingAnimes.length > 0 && (
              <section className='trending'>
                <h2>Trending Animes</h2>
                <ul>
                  {trendingAnimes.map((anime, index) => (
                    <li key={anime.$id}>
                      <p >{index+1}</p>
                      <img src={anime.poster_url} alt={anime.title} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          }
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <section className='all-animes'>
            <h2 >Anime list (Page {currentPage})</h2>
            
            {errorMessage && <p className="error">{errorMessage}</p>}

            <ul >
              {animeList.map((anime) => (
                <Card key={`${anime.mal_id}-${anime.title}`} 
                      anime={anime}
                      className="text-white"/>
              ))}
            </ul>

            {hasNextPage && (
              <button 
                onClick={loadMore} 
                disabled={isLoading}
                className=" text-red-700"
              >
                {isLoading ? <Spinner /> : 'Load more'}
              </button>
            )}

            {!hasNextPage && <p>The list is finished !</p>}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;