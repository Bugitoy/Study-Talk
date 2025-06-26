import { FlaskConical, FileText, HelpCircle, BookOpen, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { icon: FlaskConical, label: 'Home', href: '/' },
  { icon: FileText, label: 'Notes', href: '/notes' },
  { icon: HelpCircle, label: 'Exam Questions', href: '/exam-questions' },
  { icon: BookOpen, label: 'Topics', href: '/topics' },
  { icon: ClipboardList, label: 'Assignments', href: '/assignments' },
];

export default function SidebarNav({ active }: { active?: string }) {
  return (
    <nav className="fixed top-[4.6rem] left-0 h-full w-16 bg-white flex flex-col items-center z-40 shadow-lg border-2 border-gray-300">
      <div className="flex flex-col gap-4 mt-[2rem]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-200 bg-blue-100
                ${isActive ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:bg-yellow-100 hover:text-yellow-500'}`}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 