"use client"
import './page.module.css';
import Dashboard from './src/components/Dashboard';
import Navbar from './src/components/Navbar';
import PageLayout from './src/components/PageLayout';


export default function Home() {


  return (
    <PageLayout>
      <Navbar />
      <Dashboard />
    </PageLayout>
  );
}





