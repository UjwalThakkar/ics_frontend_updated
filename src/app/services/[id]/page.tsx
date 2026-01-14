// app/services/[id]/page.tsx (modified to use API)
import { notFound } from "next/navigation";
import ServiceDetails from "@/components/ServiceDetails";
import { phpAPI } from "@/lib/php-api-client"; // Adjust path as needed

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ServicePage({ params }: PageProps) {
  const { id: serviceId } = await params;

  // Fetch all services from API (assuming public endpoint returns active services)
  let services;
  try {
    const response = await phpAPI.getServices();
    console.log(response);
    services = response.data.services || []; // Assume response shape { services: Service[] }
  } catch (error) {
    console.error("Failed to fetch services:", error);
    notFound(); // Or handle error appropriately
  }

  // Find the service
  // const service = services.find(s => s.id === serviceId || s.serviceId === serviceId) // Adjust based on actual ID field
  const service = services.find(
    (s: { service_id: number }) => s.service_id === Number(serviceId)
  );
  

  if (!service) {
    notFound();
  }

  return <ServiceDetails service={service} />;
}
