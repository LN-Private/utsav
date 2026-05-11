import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Container } from './components/layout/Container';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          <AppRoutes />
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default App;