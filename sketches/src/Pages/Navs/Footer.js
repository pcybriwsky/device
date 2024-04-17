import React from 'react';
import { BsFillEnvelopeFill } from 'react-icons/bs';
import { SiSubstack } from 'react-icons/si';
import { BsFacebook, BsSubstack, BsTiktok } from "react-icons/bs";
import { AiFillInstagram, AiFillTwitterCircle, AiFillLinkedin } from 'react-icons/ai';
import { FaGithub, FaYoutube } from 'react-icons/fa';
import Typewriter from 'typewriter-effect';


const Footer = () => {
    return (
        <div className='bg-text text-background mx-auto py-[30px]'>
            <div className='mx-auto text-center'>
            <Typewriter options={{ wrapperClassName: 'text-2xl font-serif italic lowercase font-bold text-background text-center pb-[10px]', cursorClassName: 'text-text', loop: true, delay: 50, deleteSpeed: 'natural' }}
                            onInit={(typewriter) => {

                                typewriter

                                    .typeString("made with")
                                    .pauseFor(2500)
                                    .typeString(" <span class='text-accent'>love</span>")
                                    .pauseFor(2500)
                                    .deleteChars(4)
                                    .typeString("<span class='text-accent'>React</span>")
                                    .pauseFor(2500)
                                    .deleteChars(5)
                                    .typeString("<span class='text-accent'>Next.js</span>")
                                    .pauseFor(2500)
                                    .deleteChars(7)
                                    .typeString("<span class='text-accent'>TailwindCSS</span>")
                                    .pauseFor(2500)
                                    .deleteChars(11)
                                    .typeString("<span class='text-accent'>Vercel</span>")
                                    .pauseFor(2500)
                                    .deleteChars(6)
                                    .typeString("<span class='text-accent'>Figma</span>")
                                    .pauseFor(2500)
                                    .deleteChars(5)
                                    .typeString("<span class='text-accent'>love</span>")
                                    .pauseFor(2000)
                                    
                                    .start();

                            }}
                        />
                <div className='grid grid-cols-6 py-[10px] mx-auto w-[95%]'>
                    <a href='mailto:pete@ngenart.com'>
                        <BsFillEnvelopeFill className='footerIcon' />
                    </a>
                    <a href='https://substack.com/@ngenart'>
                        <SiSubstack className='footerIcon' />
                    </a>
                    <a href="https://www.instagram.com/peter_cybriwsky/">
                        <AiFillInstagram className='footerIcon' />
                    </a>
                    <a href="https://twitter.com/pete_cybriwsky">
                        <AiFillTwitterCircle className='footerIcon' />
                    </a>
                    <a href="https://www.linkedin.com/in/pete-cybriwsky/">
                        <AiFillLinkedin className='footerIcon' />
                    </a>
                    <a href="https://github.com/pcybriwsky">
                        <FaGithub className='footerIcon' />
                    </a>
                </div>
            </div>
        </div>

    );
};

export default Footer;
