
import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';

const ArtFeature = ({ image, title, description, link }) => {
    return (
        <FadeIn>
            <div className="py-[10px]">
                <div className="my-auto grid grid-cols-1 laptop:grid-cols-2">
                    <div className="text-left my-auto">
                        <a href={link}> <h2 className={`text-2xl ${link ? 'hover:underline' : "text-text opacity-[100%]"} font-serif italic font-bold my-auto`}>{title}</h2></a>
                        <p className='font-lg'>{description}</p>
                    </div>
                    <div className="max-w-[300px] mx-auto border-2 border-accent">
                        <img src={image} alt={title} />
                    </div>
                </div>
            </div>
        </FadeIn>
    );
};

export default ArtFeature;
