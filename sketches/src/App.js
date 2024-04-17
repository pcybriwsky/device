import { useState } from "react"
import React, { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

const Demo = lazy(() => import("./Pages/Home"))
const Live = lazy(() => import("./Pages/Live"))
const Test = lazy(() => import("./Pages/Test"))
const Timeline = lazy(() => import("./Pages/Timeline"))



function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Demo />} />
        <Route path="/live" element={<Live />} />
        <Route path="/test" element={<Test />} />
        <Route path="/timeline" element={<Timeline />} />
        
      </Routes>
    </Suspense>
  );
}

export default App;
