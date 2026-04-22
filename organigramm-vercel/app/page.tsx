import dynamic from "next/dynamic";

// React Flow muss client-side laden, da es SVG-Layout im Browser aufbaut.
const OrgChart = dynamic(() => import("@/components/OrgChart"), { ssr: false });

export default function Page() {
  return <OrgChart />;
}
