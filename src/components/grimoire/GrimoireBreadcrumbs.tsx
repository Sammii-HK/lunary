import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { createBreadcrumbSchema, renderJsonLd } from '@/lib/schema';

type GrimoireBreadcrumbSchemaItem = {
  name: string;
  url: string;
};

function mapSchemaItemsToBreadcrumbs(
  items: GrimoireBreadcrumbSchemaItem[],
): BreadcrumbItem[] {
  return items.map((item, index) => ({
    label: item.name,
    href: index === items.length - 1 ? undefined : item.url,
  }));
}

export function GrimoireBreadcrumbs({
  items,
}: {
  items: GrimoireBreadcrumbSchemaItem[];
}) {
  const breadcrumbSchema = createBreadcrumbSchema(items);
  const breadcrumbItems = mapSchemaItemsToBreadcrumbs(items);

  return (
    <>
      {renderJsonLd(breadcrumbSchema)}
      <Breadcrumbs items={breadcrumbItems} renderSchema={false} />
    </>
  );
}
