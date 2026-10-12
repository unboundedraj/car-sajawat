import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { CatalogManager } from "@/components/admin/catalog-manager";
import { adminGetCatalog, adminGetCategories } from "@/lib/admin-data";

export default function CatalogPage() {
  return (
    <>
      <AdminPageHeader title="Services & products" description="Create categories, then add services and products to them with estimated costs, photos and videos. Each item gets its own page." />
      <AdminData>
        <Loader />
      </AdminData>
    </>
  );
}

async function Loader() {
  const [items, categories] = await Promise.all([adminGetCatalog(), adminGetCategories()]);
  return <CatalogManager items={items} categories={categories} />;
}
