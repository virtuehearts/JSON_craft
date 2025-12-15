import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import ChatPage from './pages/ChatPage';
import GalleryPage from './pages/GalleryPage';
import VisualGalleryPage from './pages/VisualGalleryPage';
import './styles/tailwind.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ChatPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'visual-gallery', element: <VisualGalleryPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
