import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import myP5Sketch from './Live'; // Import your p5 sketch

const P5Wrapper = () => {
  const sketchRef = useRef();

  useEffect(() => {
    // Create a new p5 instance and attach it to the ref's current element
    const p5Instance = new p5(myP5Sketch, sketchRef.current);

    // Optional: Cleanup function to remove the p5 instance on component unmount
    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={sketchRef} />;
};

export default P5Wrapper;
