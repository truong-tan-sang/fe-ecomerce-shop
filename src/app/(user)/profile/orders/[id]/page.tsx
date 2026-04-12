import OrderDetailContent from "@/components/profile/OrderDetailContent";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent orderId={parseInt(id, 10)} />;
}
