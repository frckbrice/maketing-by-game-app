import { StructuredDataConfig } from '@/lib/seo/structured-data';

interface ServerStructuredDataProps {
  data: StructuredDataConfig | StructuredDataConfig[];
}

export function ServerStructuredData({ data }: ServerStructuredDataProps) {
  const structuredData = Array.isArray(data) ? data : [data];

  return (
    <>
      {structuredData.map((item, index) => (
        <script
          key={index}
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item.data, null, 2),
          }}
        />
      ))}
    </>
  );
}
