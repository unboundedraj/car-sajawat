import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { adminGetMedia } from "@/lib/admin-data";

export default function AdminGalleryPage() {
  return (
    <>
      <AdminPageHeader title="Gallery" description="Photos and videos shown on the /gallery page. Starred items also appear on the home page." />
      <AdminData>
        <Loader />
      </AdminData>
    </>
  );
}

async function Loader() {
  return <GalleryManager media={await adminGetMedia()} />;
}
