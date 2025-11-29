"use client";

import Image from "next/image";
import { useState } from "react";
import { useProfile } from "./ProfileContext";
import { userService } from "../../services/user";
import { useSession } from "next-auth/react";

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
                <div className="text-gray-500">TODO: Địa chỉ content</div>
            )}
            {activeSubTab === "Đổi mật khẩu" && (
                <div className="text-gray-500">TODO: Đổi mật khẩu content</div>
            )}
            </div>    
        </>
    );
}
