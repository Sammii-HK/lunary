import {
  createOrganizationSchema,
  createWebSiteSchema,
  createWebApplicationSchema,
  renderJsonLd,
} from '@/lib/schema';

export function StructuredData() {
  const organizationSchema = createOrganizationSchema();
  const webSiteSchema = createWebSiteSchema();
  const webApplicationSchema = createWebApplicationSchema();

  return (
    <>
      {renderJsonLd(organizationSchema)}
      {renderJsonLd(webSiteSchema)}
      {renderJsonLd(webApplicationSchema)}
    </>
  );
}
