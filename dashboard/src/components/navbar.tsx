"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { activityLog } from "@/data/activity-log";

export default function Navbar() {
    const pathname = usePathname();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { name: "Applications", path: "/dashboard", icon: "list" },
        { name: "Analytics", path: "/analytics", icon: "chart" },
        { name: "Resume Insights", path: "/resume-insights", icon: "document" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getActivityIcon = (iconType: string) => {
        switch (iconType) {
            case "plus":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                );
            case "calendar":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                );
            case "update":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                );
            case "check":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                );
            case "x":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                );
            case "note":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case "application":
                return "bg-blue-100 text-[#10559A]";
            case "interview":
                return "bg-purple-100 text-purple-600";
            case "update":
                return "bg-cyan-100 text-[#3CA2C8]";
            case "offer":
                return "bg-green-100 text-green-600";
            case "rejection":
                return "bg-gray-100 text-gray-600";
            case "note":
                return "bg-yellow-100 text-yellow-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DB4C77] to-[#F9C6D7] shadow-lg transition-transform group-hover:scale-105">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                </div>
                <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-[#DB4C77] to-[#10559A] bg-clip-text text-transparent">
                    Beacon
                </span>
                <span className="text-xs text-gray-500">Job Tracker</span>
                </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link
                    key={item.path}
                    href={item.path}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                        isActive
                            ? "bg-gradient-to-r from-[#10559A] to-[#3CA2C8] text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
                    >
                    {item.icon === "dashboard" && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        </svg>
                    )}
                    {item.icon === "list" && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    )}
                    {item.icon === "chart" && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                        </svg>
                    )}
                    {item.icon === "document" && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                        </svg>
                    )}
                    {item.name}
                    </Link>
                );
                })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
                {/* Notification Bell with Dropdown */}
                <div className="relative" ref={notificationRef}>
                    {/* <button 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#DB4C77] animate-pulse"></span>
                    </button> */}

                    {/* Notification Dropdown */}
                    {false && (
                        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#10559A] to-[#3CA2C8] px-4 py-3">
                                <h3 className="text-white font-semibold text-base">Activity Log</h3>
                                <p className="text-white/80 text-xs mt-0.5">Recent updates and changes</p>
                            </div>

                            {/* Activity List */}
                            <div className="max-h-96 overflow-y-auto">
                                {activityLog.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                            index !== activityLog.length - 1 ? "border-b border-gray-100" : ""
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                                {getActivityIcon(activity.icon)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.action}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate mt-0.5">
                                                    {activity.details}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {activity.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                                <button className="text-sm text-[#10559A] font-medium hover:text-[#3CA2C8] transition-colors w-full text-center">
                                    View all activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#10559A] to-[#3CA2C8] flex items-center justify-center text-white text-sm font-semibold">
                    DL
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">David Lim</span>
                </button>
            </div>
            </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-2">
            <div className="flex justify-around">
            {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                <Link
                    key={item.path}
                    href={item.path}
                    className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                    ${
                        isActive
                        ? "text-[#10559A]"
                        : "text-gray-500"
                    }
                    `}
                >
                    {item.icon === "dashboard" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    )}
                    {item.icon === "list" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    )}
                    {item.icon === "chart" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                    )}
                    {item.icon === "document" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                    )}
                    <span className="text-xs font-medium">{item.name}</span>
                </Link>
                );
            })}
            </div>
        </div>
        </nav>
    );
}
