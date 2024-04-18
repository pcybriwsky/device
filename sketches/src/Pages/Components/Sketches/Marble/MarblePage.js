
import React, { useEffect, useState } from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';
import SketchComponent from './MarbleSketch';

const AboutMe = () => {
    return (
        <div className="App bg-background text-text">
            <SketchComponent />
        </div>
    );
};

export default AboutMe;
