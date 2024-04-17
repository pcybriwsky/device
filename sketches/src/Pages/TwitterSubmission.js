
import React, { useState } from 'react';
import Submission from './Components/Submissions/Submission.js';





const Page = () => {
  return (
    <div className="App bg-background text-text">
      <div className='w-[80%] mx-auto'>
        {/* Need to have styling and content here */}
        <div className='flex justify-center'>
          <Submission />
        </div>
        {/* After this need to have more of a bottom Nav*/}
      </div>
    </div>
  );
}

export default Page;