import Image from 'next/image';

export const metadata = {
  title: 'Akses POS System',
  description: 'Masuk ke dashboard aplikasi kasir',
};

export default function AuthLayout({ children }) {
  const scrollImages1 = [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  ];

  const scrollImages2 = [
    "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=600&q=80",
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
  ];

  return (
    <div className="flex h-screen w-full bg-[#EBEDF2] overflow-hidden font-sans">
      
      <div className="hidden lg:flex flex-[1.2] gap-4 p-4 h-full min-w-0 relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#EBEDF2] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#EBEDF2] to-transparent z-10 pointer-events-none" />

        <div className="flex-1 min-w-0 relative overflow-hidden">
          <div className="animate-scroll-up space-y-4">
            {[...scrollImages1, ...scrollImages1].map((img, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
                <img src={img} alt="Visual" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 relative overflow-hidden">
          <div className="animate-scroll-down space-y-4">
            {[...scrollImages2, ...scrollImages2].map((img, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
                <img src={img} alt="Visual" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-12 h-full bg-white lg:rounded-l-[40px] shadow-2xl z-20 relative">
        <div className="w-full max-w-[440px]">
            {children}
        </div>
      </div>

    </div>
  );
}