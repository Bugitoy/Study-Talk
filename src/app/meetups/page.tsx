import MeetingTypeList from '@/components/MeetingTypeList';
import NextLayout from '@/components/NextLayout';

const Meetups = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <NextLayout>
      <section className="flex size-full flex-col gap-12 text-white">
        <div className="h-[303px] w-full rounded-[20px] bg-blue-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transform transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1">
          <div className="flex h-full justify-between max-md:px-5 max-md:py-8 lg:p-11">
            <div className="flex flex-col justify-between">
              <h2 className="glassmorphism max-w-[300px] rounded py-2 text-4xl text-left">
                Hi there!
              </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
              </div>
            </div>
            <div className="flex items-center justify-center max-md:hidden">
              <h2 className="text-3xl lg:text-6xl font-bold text-center leading-tight max-w-md">
                Your place to meet, compete, post and STUDY online . . .
              </h2>
          </div>
        </div>
      </div>
      <MeetingTypeList />
    </section>
    </NextLayout>
  );
};

export default Meetups;
