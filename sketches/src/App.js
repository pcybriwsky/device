import { useState } from "react"
import React, { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

const Demo = lazy(() => import("./Pages/Home"))
const Live = lazy(() => import("./Pages/Live"))
const Timeline = lazy(() => import("./Pages/Timeline"))

const Marble = lazy(() => import("./Pages/Components/Sketches/Marble/MarblePage"))
const Rings = lazy(() => import("./Pages/Components/Sketches/Lightrings/RingsPage"))
const Glow = lazy(() => import("./Pages/Components/Sketches/Glow/GlowPage"))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Demo />} />
        <Route path="/live" element={<Live />} />
        <Route path="/timeline" element={<Timeline />} />
        
        <Route path="/marble" element={<Marble />} />
        <Route path="/rings" element={<Rings />} />
        <Route path="/glow" element={<Glow />} />
      </Routes>
    </Suspense>
  );
}

export default App;
