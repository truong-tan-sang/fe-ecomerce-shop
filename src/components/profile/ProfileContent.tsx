"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useProfile } from "./ProfileContext";
import { userService } from "../../services/user";
import { addressService } from "../../services/address";
import { useSession } from "next-auth/react";
import AddressModal from "./AddressModal";
import type { AddressDto } from "@/dto/address";

const subTabs = ["Hồ sơ", "Bảng Size", "Địa chỉ", "Đổi mật khẩu", "Xóa tài khoản"];

export default function ProfileContent() {
    const profile = useProfile();
    const { data: session } = useSession();
    const [activeSubTab, setActiveSubTab] = useState("Hồ sơ");
    const [isEditing, setIsEditing] = useState(false);

    // Controlled state for editable fields (backend-aligned)
    const initialUsername = profile?.username || "";
    const initialName = profile?.name || ""; // Will be mapped to firstName; lastName blank (or split heuristic)
    const initialPhone = profile?.phone || "";

    const [username, setUsername] = useState(initialUsername);
    const [fullName, setFullName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
    
    type Gender = "MALE" | "FEMALE" | "OTHER" | "";
    const initialGender: Gender = profile?.gender || "";
    const [gender, setGender] = useState<Gender>(initialGender);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Address state
    const [addresses, setAddresses] = useState<AddressDto[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);
    const [defaultAddressId, setDefaultAddressId] = useState<number | null>(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // Load addresses when tab changes to Địa chỉ
    useEffect(() => {
        if (activeSubTab === "Địa chỉ" && profile?.id && session?.user?.access_token) {
            loadAddresses();
        }
    }, [activeSubTab, profile?.id, session?.user?.access_token]);

    const loadAddresses = async () => {
        if (!profile?.id || !session?.user?.access_token) return;
        
        setIsLoadingAddresses(true);
        try {
            const userId = typeof profile.id === 'string' ? parseInt(profile.id, 10) : profile.id;
            const response = await addressService.getUserAddresses(userId, session.user.access_token);
            const addressList = Array.isArray(response.data) ? response.data : [];
            setAddresses(addressList);
            
            // Set first address as default if none set
            if (addressList.length > 0 && !defaultAddressId) {
                setDefaultAddressId(addressList[0].id);
            }
        } catch (err) {
            console.error("[ProfileContent] Failed to load addresses:", err);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (address: AddressDto) => {
        setEditingAddress(address);
        setIsAddressModalOpen(true);
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!session?.user?.access_token) return;
        if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

        try {
            await addressService.deleteAddress(addressId, session.user.access_token);
            
            // Remove from local state
            setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
            
            // Clear default if deleted
            if (defaultAddressId === addressId) {
                const remaining = addresses.filter((addr) => addr.id !== addressId);
                setDefaultAddressId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (err) {
            console.error("[ProfileContent] Failed to delete address:", err);
            alert("Không thể xóa địa chỉ. Vui lòng thử lại.");
        }
    };

    const handleSetDefaultAddress = (addressId: number) => {
        setDefaultAddressId(addressId);
        // TODO: Could persist to backend if there's a default address API
    };

    const handleAddressModalSuccess = () => {
        loadAddresses();
    };

    const handleSave = async () => {
        if (!profile?.id) return;
        // Debug log for session and token
        console.log("Session:", session);
        console.log("Access token:", session?.user?.access_token);
        if (!session?.user?.access_token) {
            setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.");
            return;
        }
        setLoading(true);
        setMessage(null);
        setError(null);

        // Split full name into firstName/lastName
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");

        const updatePayload = {
            username,
            firstName,
            lastName: lastName || undefined,
            phone: phone || undefined,
            gender: gender || undefined,
        };

        console.log("=== Update User Payload ===");
        console.log("Profile ID:", profile.id);
        console.log("Payload:", JSON.stringify(updatePayload, null, 2));
        console.log("Access Token (first 20 chars):", session.user.access_token?.substring(0, 20));
        console.log("==========================");

        try {
            const res = await userService.updateUser(
                profile.id,
                updatePayload,
                session.user.access_token as string
            );
            console.log("=== Backend Response ===");
            console.log(JSON.stringify(res, null, 2));
            console.log("=======================");
            
            if ((res as any)?.statusCode && (res as any).statusCode >= 400) {
                setError((res as any).message || "Cập nhật thất bại");
            } else {
                setMessage("Cập nhật thành công");
                setIsEditing(false);
            }
        } catch (e: any) {
            console.error("=== Update Error ===");
            console.error(e);
            console.error("===================");
            setError(e?.message || "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Sub-tabs */}
            <div className="flex gap-0 mb-6 bg-white">
                {subTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`flex-1 text-center text-sm transition-all p-3 ${
                            activeSubTab === tab
                                ? "font-bold text-black relative after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-black"
                                : "text-gray-600 hover:text-black"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="bg-white px-14 py-10">            
            {/* Content area - Hồ sơ tab */}
            {activeSubTab === "Hồ sơ" && (
                <div className="max-w-4xl">
                    <div className="flex items-start gap-8 divide-x">
                        {/* Left column - Form */}
                        <div className="flex-1 space-y-4 pr-8">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Tên người dùng</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên người dùng"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Họ và tên</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nhập họ và tên"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Email</label>
                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    readOnly
                                    className="border px-3 py-2 text-sm bg-gray-50 text-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            {/* Gender selection */}
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Giới tính</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="MALE"
                                            checked={gender === "MALE"}
                                            onChange={(e) => setGender(e.target.value as Gender)}
                                            disabled={!isEditing}
                                        />
                                        <span>Nam</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="FEMALE"
                                            checked={gender === "FEMALE"}
                                            onChange={(e) => setGender(e.target.value as Gender)}
                                            disabled={!isEditing}
                                        />
                                        <span>Nữ</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="OTHER"
                                            checked={gender === "OTHER"}
                                            onChange={(e) => setGender(e.target.value as Gender)}
                                            disabled={!isEditing}
                                        />
                                        <span>Khác</span>
                                    </label>
                                </div>
                            </div>

                            {/* Unsupported field group (gender) removed per OpenAPI absence */}

                            {/* Unsupported field group (birth date) removed per OpenAPI absence */}

                            {/* Unsupported field (CCCD) removed per OpenAPI absence */}

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <div />
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                handleSave();
                                            } else {
                                                setIsEditing(true);
                                            }
                                        }}
                                        disabled={loading}
                                        className="bg-black text-white px-6 py-2 text-sm font-semibold hover:bg-gray-800 w-fit disabled:opacity-60"
                                    >
                                        {loading ? "Đang lưu..." : isEditing ? "Lưu" : "Sửa hồ sơ"}
                                    </button>
                                    {message && <div className="text-green-600 text-sm">{message}</div>}
                                    {error && <div className="text-red-600 text-sm">{error}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Right column - Avatar */}
                        <div className="flex flex-col items-center gap-4 pl-8">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                                <Image
                                    src={profile?.image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80"}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50">
                                Chọn Ảnh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Placeholder for other tabs */}
            {activeSubTab === "Bảng Size" && (
                <div className="text-gray-500">TODO: Bảng Size content</div>
            )}
            {activeSubTab === "Địa chỉ" && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Địa chỉ của tôi</h2>
                        <button
                            onClick={handleAddAddress}
                            className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Thêm địa chỉ mới
                        </button>
                    </div>

                    {isLoadingAddresses ? (
                        <div className="text-center text-gray-600 py-8">Đang tải...</div>
                    ) : addresses.length === 0 ? (
                        <div className="border border-dashed border-gray-300 p-12 text-center text-gray-500">
                            <i className="fa-solid fa-location-dot text-4xl mb-4 text-gray-300" />
                            <p>Bạn chưa có địa chỉ nào</p>
                            <button
                                onClick={handleAddAddress}
                                className="mt-4 border border-black bg-white text-black px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                Thêm địa chỉ mới
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => {
                                const isDefault = defaultAddressId === address.id;
                                const fullAddress = `${address.street}, ${address.ward}, ${address.district}, ${address.province}${address.zipCode ? `, ${address.zipCode}` : ""}, ${address.country}`;
                                
                                return (
                                    <div
                                        key={address.id}
                                        className="border bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-semibold">
                                                        {/* TODO: Add recipient name from profile or separate field */}
                                                        {profile?.name || "Người nhận"}
                                                    </span>
                                                    <span className="text-gray-600">|</span>
                                                    <span className="text-gray-600">
                                                        {profile?.phone || "(+84)927439685"}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">
                                                    {fullAddress}
                                                </p>
                                                {isDefault && (
                                                    <span className="inline-block border border-black px-2 py-1 text-xs">
                                                        Mặc định
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className="text-red-600 border border-red-600 px-3 py-1 text-sm hover:bg-red-50"
                                                >
                                                    Xóa
                                                </button>
                                                <button
                                                    onClick={() => handleEditAddress(address)}
                                                    className="border border-black px-3 py-1 text-sm hover:bg-gray-100"
                                                >
                                                    Cập nhật
                                                </button>
                                                {!isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefaultAddress(address.id)}
                                                        className="border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                                                    >
                                                        Đặt làm mặc định
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Address Modal */}
                    <AddressModal
                        isOpen={isAddressModalOpen}
                        onClose={() => setIsAddressModalOpen(false)}
                        onSuccess={handleAddressModalSuccess}
                        editAddress={editingAddress}
                    />
                </div>
            )}
            {activeSubTab === "Đổi mật khẩu" && (
                <div className="text-gray-500">TODO: Đổi mật khẩu content</div>
            )}
            </div>    
        </>
    );
}
