import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent font-medium' : ''}>
                    English 🇬🇧
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className={language === 'hi' ? 'bg-accent font-medium' : ''}>
                    हिंदी 🇮🇳
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
