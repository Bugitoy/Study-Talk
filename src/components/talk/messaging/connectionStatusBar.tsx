import Loader from '@/components/Loader';

export default function ConnectionStatusBar({ strangerUsername }: { strangerUsername: string }) {
    return (
        <div className='flex items-center justify-center mb-[10px] text-[1.5em]'>
            {strangerUsername ? strangerUsername : (<Loader fullScreen={false} />)}
        </div>
    )
}