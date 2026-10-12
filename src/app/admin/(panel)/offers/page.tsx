import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { OffersManager } from "@/components/admin/offers-manager";
import { adminGetOffers } from "@/lib/admin-data";

export default function OffersPage() {
  return (
    <>
      <AdminPageHeader title="Offers strip" description="Deals and announcements that scroll in the red strip right below the hero banner." />
      <AdminData>
        <Loader />
      </AdminData>
    </>
  );
}

async function Loader() {
  return <OffersManager offers={await adminGetOffers()} />;
}
