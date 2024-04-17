
import React, { useState } from 'react';
import Drawing from './Components/Sketches/LivePage';

const Home = () => {
  return (
    <div className="App bg-background text-text">
      <Drawing />
      {/* Comment */}
    </div>
  );
}

export default Home;