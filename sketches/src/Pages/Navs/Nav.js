
import React, { useEffect, useState } from 'react';

const Nav = () => {
  const [navColor, setNavColor] = useState('bg-background');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const navHeight = document.querySelector('nav').offsetHeight;

      if (scrollPosition > navHeight) {
        setNavColor('bg-alt');
      } else {
        setNavColor('bg-background');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`${navColor} sticky top-0`}>
      <div className='mx-auto w-[80%]'>
      <a href='#pete' className='scroll-smooth'>
          <p
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            className={`hover:text-primary text-2xl my-auto flex text-text text-left py-[10px] ease-linear transition-all duration-150 scroll-smooth`}
          ><img className='w-[48px] h-[48px]' src={require("../../Assets/Images/icon64.png")}></img><span className={`${isHovered ? 'visible text-[#000000]' : 'invisible'} ease-linear my-auto transition-all duration-150`}>(ete)</span>
          </p>
        </a>
        </div>
    </nav>
  );
};

export default Nav;
