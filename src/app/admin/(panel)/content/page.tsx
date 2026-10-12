import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { ContentEditor } from "@/components/admin/content-editor";
import { adminGetContent } from "@/lib/admin-data";

export default function ContentPage() {
  return (
    <>
      <AdminPageHeader
        title="Site content"
        description="Edit the text and media on the landing page, contact details and chatbot. Changes go live as soon as you save."
      />
      <AdminData>
        <Loader />
      </AdminData>
    </>
  );
}

async function Loader() {
  return <ContentEditor initial={await adminGetContent()} />;
}
