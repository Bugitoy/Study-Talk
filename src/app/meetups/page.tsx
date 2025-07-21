import MeetingTypeList from '@/components/MeetingTypeList';
import NextLayout from '@/components/NextLayout';

const Meetups = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <NextLayout>
      <section className="flex size-full flex-col gap-6 sm:gap-8 lg:gap-12 text-white px-4 sm:px-6 lg:px-8">
        <div className="h-[200px] sm:h-[250px] lg:h-[303px] w-full rounded-[16px] sm:rounded-[20px] bg-blue-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transform transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1">
          <div className="flex h-full justify-between p-4 sm:p-6 lg:p-11">
            <div className="flex flex-col justify-between">
              <h2 className="glassmorphism max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] rounded py-2 text-2xl sm:text-3xl lg:text-4xl text-left">
                Hi there!
              </h2>
              <div className="flex flex-col gap-1 sm:gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-7xl font-extrabold">{time}</h1>
                <p className="text-sm sm:text-lg lg:text-2xl font-medium text-sky-1">{date}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center">
              <h2 className="text-lg sm:text-2xl lg:text-3xl xl:text-6xl font-bold text-center leading-tight max-w-[200px] sm:max-w-[300px] lg:max-w-md">
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
