import React from 'react'

const Card = ({anime }) => {
    const imageUrl = anime.images?.jpg?.image_url;
  return (
    <div className='anime-card'>
    <li className='text-white mt-[10px] text-center'>
        <img src ={imageUrl} alt='anime.title' />
      <div className='mt-4'>
        {anime.title ||  "without title"}
        <div className='content '>
            <div className='rating '>
                <img src="star.svg" alt="" />
                <p>{anime.score? anime.score.toFixed(2): 'no score'}</p>
            </div>
            <span>.</span>
            <p className='type'>{anime.type}</p>
            <span>.</span>
            <p className='type'>Eps : {anime.episodes }</p>
        </div>
      </div>
      
    </li>
    </div>
  );
};

export default Card;
