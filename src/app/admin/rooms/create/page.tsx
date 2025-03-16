"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const createRoomSchema = z.object({
  name: z.string().min(1, "會議室名稱不能為空").max(50, "會議室名稱不能超過50個字"),
  capacity: z.string()
    .min(1, "容納人數不能為空")
    .regex(/^\d+$/, "容納人數必須為整數"),
  imageUrl: z.string().url("必須是有效的圖片URL"),
  facilities: z.string().min(1, "至少需要一項設施"),
  description: z.string().min(1, "描述不能為空").max(500, "描述不能超過500個字"),
  location: z.string().min(1, "位置不能為空").max(100, "位置不能超過100個字"),
  area: z.string()
    .min(1, "面積不能為空")
    .regex(/^\d+(\.\d{1,2})?$/, "面積必須為數字，最多保留兩位小數"),
  hourlyRate: z.string()
    .min(1, "每小時收費不能為空")
    .regex(/^\d+$/, "每小時收費必須為整數"),
});

type FormValues = z.infer<typeof createRoomSchema>;

export default function CreateRoomPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      capacity: "",
      imageUrl: "",
      facilities: "",
      description: "",
      location: "",
      area: "",
      hourlyRate: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // 驗證數值
      const capacity = parseInt(data.capacity, 10);
      if (isNaN(capacity) || capacity <= 0 || capacity > 1000) {
        throw new Error("容納人數必須為1-1000之間的正整數");
      }

      const area = parseFloat(data.area);
      if (isNaN(area) || area <= 0 || area > 1000) {
        throw new Error("面積必須為0-1000之間的數字");
      }

      const hourlyRate = parseInt(data.hourlyRate, 10);
      if (isNaN(hourlyRate) || hourlyRate < 0 || hourlyRate > 100000) {
        throw new Error("每小時收費必須為0-100,000之間的整數");
      }

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          facilities: data.facilities.split(",").map((f) => f.trim()),
          capacity,
          area,
          hourlyRate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "創建會議室失敗");
      }

      toast.success("會議室創建成功！");
      router.push("/admin/rooms");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "創建會議室時發生錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">創建新會議室</h1>
        <p className="text-gray-600 mt-2">請填寫以下表單來創建新的會議室</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>會議室名稱</FormLabel>
                <FormControl>
                  <Input placeholder="請輸入會議室名稱" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>容納人數</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="請輸入容納人數" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>圖片 URL</FormLabel>
                <FormControl>
                  <Input placeholder="請輸入圖片URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>設施（用逗號分隔）</FormLabel>
                <FormControl>
                  <Input placeholder="例如：投影機, WiFi, 白板" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea placeholder="請輸入會議室描述" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>位置</FormLabel>
                <FormControl>
                  <Input placeholder="請輸入會議室位置" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>面積</FormLabel>
                <FormControl>
                  <Input placeholder="請輸入會議室面積" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>每小時收費</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="請輸入每小時收費" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "創建中..." : "創建會議室"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 