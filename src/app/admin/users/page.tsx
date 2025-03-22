"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { type User } from "@/types/schema";
import { getUsers } from "@/actions/admin/get-users";
import { updateUser } from "@/actions/admin/update-user";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"PROMOTE" | "DEMOTE" | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      // 檢查是否為管理員
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchUsers();
    }
  }, [status, router, session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setUsers(users);
    } catch (error) {
      console.error("獲取用戶列表失敗:", error);
      toast.error(error instanceof Error ? error.message : "獲取用戶列表失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      await updateUser(
        selectedUser.id,
        actionType === "PROMOTE" ? "ADMIN" : "USER"
      );

      toast.success(
        actionType === "PROMOTE"
          ? "已成功將用戶設為管理員"
          : "已成功移除用戶的管理員權限"
      );

      await fetchUsers();
      setIsActionModalOpen(false);
      setSelectedUser(null);
      setActionType(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失敗");
    }
  };

  const openActionModal = (user: User, action: "PROMOTE" | "DEMOTE") => {
    setSelectedUser(user);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2be]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">用戶管理</h1>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">目前沒有任何用戶</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {user.name}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>電子郵件：{user.email}</p>
                    <p>註冊時間：{new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === "ADMIN"
                        ? "text-blue-500 bg-blue-50"
                        : "text-gray-500 bg-gray-50"
                    }`}
                  >
                    {user.role === "ADMIN" ? "管理員" : "一般用戶"}
                  </span>
                  {session?.user?.id !== user.id && (
                    <button
                      onClick={() =>
                        openActionModal(user, user.role === "ADMIN" ? "DEMOTE" : "PROMOTE")
                      }
                      className={`px-3 py-1 text-white rounded-lg text-sm ${
                        user.role === "ADMIN"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {user.role === "ADMIN" ? "移除管理員權限" : "設為管理員"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedUser(null);
          setActionType(null);
        }}
        title={`確認${actionType === "PROMOTE" ? "提升" : "移除"}權限`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            確定要{actionType === "PROMOTE" ? "將此用戶設為管理員" : "移除此用戶的管理員權限"}嗎？
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {actionType === "PROMOTE"
              ? "設為管理員後，該用戶將可以管理所有預約和用戶。"
              : "移除權限後，該用戶將只能使用一般功能。"}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setIsActionModalOpen(false);
                setSelectedUser(null);
                setActionType(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              返回
            </button>
            <button
              onClick={handleAction}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                actionType === "PROMOTE"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              確認{actionType === "PROMOTE" ? "提升" : "移除"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 