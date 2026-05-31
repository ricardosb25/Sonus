export type AppLanguage = 'pt-BR' | 'en' | 'ja';

export const languageOptions: Array<{
  id: AppLanguage;
  label: string;
  description: string;
}> = [
  {
    id: 'pt-BR',
    label: 'Portugues BR',
    description: 'Interface em Portugues Brasileiro.',
  },
  {
    id: 'en',
    label: 'English',
    description: 'Interface in English.',
  },
  {
    id: 'ja',
    label: '日本語',
    description: '日本語のインターフェース。',
  },
];
