import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { EnquiriesManager } from "@/components/admin/enquiries-manager";
import { adminGetEnquiries } from "@/lib/admin-data";

export default function EnquiriesPage() {
  return (
    <>
      <AdminPageHeader title="Enquiries" description="Callback requests submitted from the contact page." />
      <AdminData>
        <Loader />
      </AdminData>
    </>
  );
}

async function Loader() {
  return <EnquiriesManager enquiries={await adminGetEnquiries()} />;
}
