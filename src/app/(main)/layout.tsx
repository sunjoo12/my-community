import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col min-h-screen' style={{ backgroundColor: '#F4EDE8' }}>
      <Header />
      <div className='pt-16'>
        <Navigation />
        <main className='flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6'>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
