import Link from 'next/link';
import Image from 'next/image';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => {
  return (
    <section className="flex h-screen w-full justify-center items-center">
      <Card className="w-full max-w-[520px] border-none bg-thanodi-blue p-6 py-9 text-white">
        <CardContent>
          <div className="flex flex-col gap-9">
            <div className="flex flex-col gap-3.5">
              {iconUrl && (
                <div className="flex justify-center items-center">
                  <Image src={iconUrl} width={72} height={72} alt="icon" />
                </div>
              )}
              <p className="text-center text-black text-2xl font-semibold">{title}</p>
            </div>

            <Button asChild className="bg-blue-300 hover:bg-blue-200 text-white text-lg py-8 px-6">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Alert;
