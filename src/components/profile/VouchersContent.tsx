"use client";

const mockVouchers = [
  {
    id: "1",
    code: "A7SALE15",
    discount: "15%",
    title: "Giảm 15% cho đơn hàng từ 500K",
    description: "Áp dụng cho tất cả sản phẩm",
    validFrom: "01/11/2025",
    validTo: "30/11/2025",
    status: "active",
  },
  {
    id: "2",
    code: "FREESHIP",
    discount: "500K",
    title: "Miễn phí vận chuyển",
    description: "Áp dụng cho đơn hàng từ 300K",
    validFrom: "15/11/2025",
    validTo: "31/12/2025",
    status: "active",
  },
  {
    id: "3",
    code: "NEWUSER20",
    discount: "20%",
    title: "Giảm 20% cho khách hàng mới",
    description: "Áp dụng cho đơn hàng đầu tiên",
    validFrom: "01/11/2025",
    validTo: "31/12/2025",
    status: "active",
  },
  {
    id: "4",
    code: "FLASH30",
    discount: "30%",
    title: "Flash Sale - Giảm 30%",
    description: "Áp dụng cho các sản phẩm được chọn",
    validFrom: "10/11/2025",
    validTo: "20/11/2025",
    status: "expired",
  },
  {
    id: "5",
    code: "WINTER25",
    discount: "25%",
    title: "Giảm 25% bộ sưu tập mùa đông",
    description: "Áp dụng cho áo khoác, áo len",
    validFrom: "01/12/2025",
    validTo: "31/01/2026",
    status: "upcoming",
  },
  {
    id: "6",
    code: "VIP100K",
    discount: "100K",
    title: "Giảm 100K cho thành viên VIP",
    description: "Áp dụng cho đơn hàng từ 1 triệu",
    validFrom: "01/11/2025",
    validTo: "31/12/2025",
    status: "active",
  },
];

export default function VouchersContent() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Voucher của bạn</h1>

      {/* Search bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="flex-1 flex items-stretch border">
            <input
              type="text"
              placeholder="Tìm kiếm voucher theo mã hoặc tên"
              className="flex-1 px-4 py-2 text-sm focus:outline-none"
            />
            <button className="px-4 bg-gray-50 hover:bg-gray-100 transition-colors">
              <i className="fa-solid fa-magnifying-glass text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-4 mb-6 border-b">
        <button className="pb-2 text-sm font-bold text-black border-b-2 border-black">
          Tất cả
        </button>
        <button className="pb-2 text-sm text-gray-600 hover:text-black">
          Đang hoạt động
        </button>
        <button className="pb-2 text-sm text-gray-600 hover:text-black">
          Sắp diễn ra
        </button>
        <button className="pb-2 text-sm text-gray-600 hover:text-black">
          Đã hết hạn
        </button>
      </div>

      {/* Vouchers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockVouchers.map((voucher) => (
          <div
            key={voucher.id}
            className={`border bg-white overflow-hidden ${
              voucher.status === "expired" ? "opacity-50" : ""
            }`}
          >
            {/* Voucher header with discount */}
            <div className="bg-black text-white p-4 text-center">
              <div className="text-3xl font-bold mb-1">{voucher.discount}</div>
              <div className="text-xs uppercase tracking-wider">Giảm giá</div>
            </div>

            {/* Voucher content */}
            <div className="p-4">
              <h3 className="font-bold text-sm mb-2">{voucher.title}</h3>
              <p className="text-xs text-gray-600 mb-3">
                {voucher.description}
              </p>

              {/* Code display */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 border border-dashed">
                <span className="flex-1 text-xs font-mono font-semibold">
                  {voucher.code}
                </span>
                <button className="text-xs text-blue-600 hover:underline">
                  Sao chép
                </button>
              </div>

              {/* Validity period */}
              <div className="text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <i className="fa-regular fa-calendar w-4" />
                  <span>Từ {voucher.validFrom}</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fa-regular fa-calendar w-4" />
                  <span>Đến {voucher.validTo}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-2 py-1 ${
                    voucher.status === "active"
                      ? "bg-green-100 text-green-700"
                      : voucher.status === "upcoming"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {voucher.status === "active"
                    ? "Đang hoạt động"
                    : voucher.status === "upcoming"
                    ? "Sắp diễn ra"
                    : "Đã hết hạn"}
                </span>
                {voucher.status === "active" && (
                  <button className="text-xs text-blue-600 hover:underline font-semibold">
                    Dùng ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state placeholder */}
      {mockVouchers.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <i className="fa-solid fa-ticket text-4xl mb-4" />
          <p>Chưa có voucher nào</p>
        </div>
      )}
    </>
  );
}
