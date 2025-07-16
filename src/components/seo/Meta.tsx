import { Helmet } from 'react-helmet-async';

interface MetaProps {
  title?: string;
  description?: string;
}

export function Meta({ title, description }: MetaProps) {
  if (!title && !description) return null;
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}