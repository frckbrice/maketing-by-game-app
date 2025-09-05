'use client';

import { StructuredDataConfig } from '@/lib/seo/structured-data';

interface StructuredDataProps {
  data: StructuredDataConfig | StructuredDataConfig[];
}

export function StructuredData({ data }: StructuredDataProps) {
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
