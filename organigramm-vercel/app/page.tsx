import dynamic from "next/dynamic";

// Client-only: ViewSwitcher mountet React-Flow + RACI-Matrix je nach Tab.
const ViewSwitcher = dynamic(() => import("@/components/ViewSwitcher"), { ssr: false });

export default function Page() {
  return <ViewSwitcher />;
}
