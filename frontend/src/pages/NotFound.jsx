import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="pt-40 pb-32 text-center px-margin-mobile">
      <h1 className="font-display-lg text-headline-xl text-primary mb-4">404</h1>
      <p className="text-on-surface-variant mb-8">{t('error.404_description')}</p>
      <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-label-md hover:bg-primary-container transition-colors">
        {t('error.back_home')}
      </Link>
    </div>
  );
}
