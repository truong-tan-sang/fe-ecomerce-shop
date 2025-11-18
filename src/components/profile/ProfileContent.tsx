"use client";

import Image from "next/image";
import { useState } from "react";

const subTabs = ["Hồ sơ", "Bảng Size", "Địa chỉ", "Đổi mật khẩu", "Xóa tài khoản"];

export default function ProfileContent() {
    const [activeSubTab, setActiveSubTab] = useState("Hồ sơ");
    const [isEditing, setIsEditing] = useState(false);

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
                                    defaultValue="truong-tan-sang"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Họ và tên</label>
                                <input
                                    type="text"
                                    defaultValue="Trương Tấn Sang"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Email</label>
                                <input
                                    type="email"
                                    defaultValue="sang.truongtan2004@hcmut.edu.vn"
                                    disabled
                                    className="border px-3 py-2 text-sm bg-gray-50 text-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Số điện thoại</label>
                                <input
                                    type="text"
                                    defaultValue="*******692"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                                <label className="text-sm text-gray-600 pt-2">Giới tính</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            disabled={!isEditing}
                                            className="h-4 w-4 rounded-none border border-black accent-black"
                                        />
                                        <span className="text-sm">Nam</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            disabled={!isEditing}
                                            className="h-4 w-4 rounded-none border border-black accent-black"
                                        />
                                        <span className="text-sm">Nữ</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            disabled={!isEditing}
                                            className="h-4 w-4 rounded-none border border-black accent-black"
                                        />
                                        <span className="text-sm">Khác</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Ngày sinh</label>
                                <div className="flex gap-2">
                                    <select
                                        disabled={!isEditing}
                                        className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                    >
                                        <option>Ngày</option>
                                    </select>
                                    <select
                                        disabled={!isEditing}
                                        className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                    >
                                        <option>Tháng</option>
                                    </select>
                                    <select
                                        disabled={!isEditing}
                                        className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                    >
                                        <option>Năm</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">Số CCCD</label>
                                <input
                                    type="text"
                                    defaultValue="066204012876"
                                    disabled={!isEditing}
                                    className="border px-3 py-2 text-sm disabled:bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <div />
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="bg-black text-white px-6 py-2 text-sm font-semibold hover:bg-gray-800 w-fit"
                                >
                                    {isEditing ? "Lưu" : "sửa hồ sơ"}
                                </button>
                            </div>
                        </div>

                        {/* Right column - Avatar */}
                        <div className="flex flex-col items-center gap-4 pl-8">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                                <Image
                                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80"
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
