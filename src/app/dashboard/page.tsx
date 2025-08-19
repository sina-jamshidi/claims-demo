"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { RoleSwitcher } from "@/components/role-switcher";
import { useRouter } from "next/navigation";
import { faker } from "@faker-js/faker";
import { Plus, Filter } from "lucide-react";

interface Claim {
    id: string;
    claimant_name: string;
    date: string;
    status: "New" | "In Review" | "Closed";
    summary: string;
    details: string;
    created_at: string;
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [loadingClaims, setLoadingClaims] = useState(true);
    const [generatingClaim, setGeneratingClaim] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            // Since we have mock auth, this shouldn't happen, but redirect to login page anyway
            router.push("/login");
        } else if (user) {
            fetchClaims();
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (statusFilter === "All") {
            setFilteredClaims(claims);
        } else {
            setFilteredClaims(
                claims.filter((claim) => claim.status === statusFilter)
            );
        }
    }, [claims, statusFilter]);

    const fetchClaims = async () => {
        try {
            const response = await fetch("/api/claims");
            if (response.ok) {
                const data = await response.json();
                setClaims(data);
            }
        } catch (error) {
            console.error("Error fetching claims:", error);
        } finally {
            setLoadingClaims(false);
        }
    };

    const generateFakeClaim = async () => {
        setGeneratingClaim(true);

        const fakeClaim = {
            claimant_name: faker.person.fullName(),
            date: faker.date.recent().toISOString().split("T")[0],
            status: faker.helpers.arrayElement([
                "New",
                "In Review",
                "Closed",
            ]) as "New" | "In Review" | "Closed",
            summary: faker.lorem.sentence({ min: 8, max: 15 }),
            details: faker.lorem.paragraphs(3),
        };

        try {
            const response = await fetch("/api/claims", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(fakeClaim),
            });

            if (response.ok) {
                const newClaim = await response.json();
                // Optimistic UI update - add to the beginning of the list
                setClaims((prev) => [newClaim, ...prev]);
            } else {
                alert("Error creating fake claim");
            }
        } catch (error) {
            console.error("Error creating fake claim:", error);
            alert("Error creating fake claim");
        } finally {
            setGeneratingClaim(false);
        }
    };

    // Initialize database on first load
    useEffect(() => {
        const initDB = async () => {
            try {
                await fetch("/api/init", { method: "POST" });
            } catch (error) {
                console.error("Error initializing database:", error);
            }
        };
        initDB();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                ClaimBridge Admin Portal
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome, {user.name} ({user.role})
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <RoleSwitcher />
                            {user.role === "super-admin" && (
                                <button
                                    onClick={() =>
                                        router.push(
                                            "/dashboard/admin-management"
                                        )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Manage Admins
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Controls */}
                <div className="px-4 py-4 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="All">All Claims</option>
                                <option value="New">New</option>
                                <option value="In Review">In Review</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <button
                            onClick={generateFakeClaim}
                            disabled={generatingClaim}
                            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {generatingClaim
                                ? "Generating..."
                                : "Generate Fake Claim"}
                        </button>
                    </div>

                    {/* Claims Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {loadingClaims ? (
                            <div className="p-6 text-center">
                                Loading claims...
                            </div>
                        ) : filteredClaims.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                {statusFilter === "All"
                                    ? "No claims found. Try generating a fake claim!"
                                    : `No ${statusFilter.toLowerCase()} claims found`}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {filteredClaims.map((claim) => (
                                    <li key={claim.id}>
                                        <div
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/claims/${claim.id}`
                                                )
                                            }
                                            className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-indigo-600 truncate">
                                                            {
                                                                claim.claimant_name
                                                            }
                                                        </p>
                                                        <div className="ml-2 flex-shrink-0 flex">
                                                            <p
                                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    claim.status ===
                                                                    "New"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : claim.status ===
                                                                          "In Review"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {claim.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex justify-between">
                                                        <div className="sm:flex">
                                                            <p className="flex items-center text-sm text-gray-500">
                                                                Date:{" "}
                                                                {new Date(
                                                                    claim.date
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                        {claim.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
