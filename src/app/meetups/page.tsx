import MeetingTypeList from '@/components/MeetingTypeList';
import NextLayout from '@/components/NextLayout';
import Image from 'next/image';

const Meetups = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <NextLayout>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      <main id="main-content" className="flex size-full flex-col gap-6 sm:gap-8 lg:gap-12 text-white px-4 sm:px-6 lg:px-8" role="main">
        {/* Welcome Section */}
        <section 
          className="h-[200px] sm:h-[250px] lg:h-[303px] w-full rounded-[16px] sm:rounded-[20px] bg-slate-400 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transform transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 overflow-hidden relative group"
          aria-labelledby="welcome-heading"
          role="banner"
        >
          {/* GIF Background - Upper Half */}
          <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
            <Image
              src="/Images/meetups/studying-asian.gif"
              alt="Studying animation"
              fill
              className="object-cover"
              priority
            />
            {/* Slate overlay with hover effect */}
            <div className="absolute inset-0 bg-slate-400 bg-opacity-80 group-hover:bg-opacity-20 transition-all duration-300"></div>
          </div>
          
          <div className="flex h-full justify-between p-4 sm:p-6 lg:p-11 relative z-10">
            <div className="flex flex-col justify-between">
              {/* Upper half content - overlaid on GIF */}
              <div className="h-1/2 flex flex-col justify-center">
                <h1 
                  id="welcome-heading"
                  className="glassmorphism max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] rounded py-2 text-2xl sm:text-3xl lg:text-4xl text-left text-white drop-shadow-lg"
                >
                  Hi there!
                </h1>
              </div>
              
              {/* Lower half content - time and date */}
              <div className="h-1/2 flex flex-col justify-end">
                <div className="flex flex-col gap-1 sm:gap-2" aria-live="polite" aria-label="Current time and date">
                  <time 
                    dateTime={now.toISOString()}
                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-7xl font-extrabold text-white drop-shadow-lg"
                    aria-label={`Current time: ${time}`}
                  >
                    {time}
                  </time>
                  <time 
                    dateTime={now.toISOString()}
                    className="text-sm sm:text-lg lg:text-2xl font-medium text-sky-1 drop-shadow-lg"
                    aria-label={`Current date: ${date}`}
                  >
                    {date}
                  </time>
                </div>
              </div>
            </div>
            
            {/* Right side content - overlaid on GIF in upper half */}
            <div className="hidden sm:flex items-center justify-center h-[180px]">
              <h2 className="text-2xl sm:text-3xl xl:text-6xl font-bold text-center leading-tight max-w-[200px] sm:max-w-[300px] lg:max-w-md text-white drop-shadow-lg">
                Your place to meet, compete, post and STUDY online . . .
              </h2>
            </div>
            
            {/* Mobile version of the tagline */}
            <div className="sm:hidden flex items-center justify-center h-[170px]">
              <h2 className="text-2xl sm:text-2xl lg:text-3xl xl:text-6xl font-bold text-center leading-tight max-w-[200px] sm:max-w-[300px] lg:max-w-md text-white drop-shadow-lg">
                Your place to meet, compete, post and STUDY online . . .
              </h2>
            </div>
          </div>
        </section>
        
        {/* Meeting Types Section */}
        <section aria-labelledby="meeting-types-heading">
          <h2 id="meeting-types-heading" className="sr-only">Available Meeting Types</h2>
          <MeetingTypeList />
        </section>
      </main>
    </NextLayout>
  );
};

export default Meetups;
