"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoomSchema } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { generate24HourTimeSlots } from "@/lib/utils";
import { toast } from "sonner";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { Card } from "@/components/ui/card";

// 移除不需要的字段
const CreateRoomSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

const facilities = [
  "投影機",
  "白板",
  "電視",
  "視訊設備",
  "音響系統",
  "網路",
  "冷氣",
  "飲水機",
];

export default function CreateRoomPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeSlots = generate24HourTimeSlots();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      facilities: [],
      availableTimeSlots: [],
    },
  });

  const onSubmit = async (data: CreateRoomInput) => {
    try {
      if (selectedTimeSlots.length === 0) {
        toast.error("請至少選擇一個可用時段");
        return;
      }

      setIsSubmitting(true);
      
      // 確保將選中的時段添加到表單數據中
      data.availableTimeSlots = selectedTimeSlots;

      // 添加日誌輸出
      console.log("提交的數據:", data);
      console.log("選中的時段:", selectedTimeSlots);

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "創建會議室失敗");
      }

      toast.success("會議室創建成功");
      router.push("/admin/rooms");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "創建會議室失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacilityChange = (checked: CheckedState, facility: string) => {
    const currentFacilities = getValues("facilities");
    setValue(
      "facilities",
      checked
        ? [...currentFacilities, facility]
        : currentFacilities.filter((f) => f !== facility)
    );
  };

  const handleBulkTimeSlotChange = (checked: CheckedState, slots: string[]) => {
    setSelectedTimeSlots(prev => {
      const newSlots = checked
        ? [...new Set([...prev, ...slots])].sort()
        : prev.filter(slot => !slots.includes(slot));
      
      // 添加日誌輸出
      console.log("更新前的時段:", prev);
      console.log("新的時段:", newSlots);
      
      // 更新表單的 availableTimeSlots 值
      setValue('availableTimeSlots', newSlots);
      return newSlots;
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">新增會議室</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">會議室名稱</label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">容納人數</label>
          <Input
            type="number"
            {...register("capacity", { valueAsNumber: true })}
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">圖片URL</label>
          <Input {...register("imageUrl")} />
          {errors.imageUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <Textarea {...register("description")} />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">位置</label>
          <Input {...register("location")} />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">面積</label>
          <Input {...register("area")} />
          {errors.area && (
            <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">每小時收費</label>
          <Input
            type="number"
            {...register("hourlyRate", { valueAsNumber: true })}
          />
          {errors.hourlyRate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.hourlyRate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">設施配備</label>
          <div className="grid grid-cols-2 gap-4">
            {facilities.map((facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox
                  id={facility}
                  onCheckedChange={(checked) =>
                    handleFacilityChange(checked as CheckedState, facility)
                  }
                />
                <label
                  htmlFor={facility}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {facility}
                </label>
              </div>
            ))}
          </div>
          {errors.facilities && (
            <p className="text-red-500 text-sm mt-1">
              {errors.facilities.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">可用時段</label>
          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">凌晨 (00:00-05:59)</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dawn-all"
                    onCheckedChange={(checked) => {
                      const dawnSlots = timeSlots.filter(slot => {
                        const hour = parseInt(slot.split(":")[0]);
                        return hour >= 0 && hour < 6;
                      });
                      handleBulkTimeSlotChange(checked, dawnSlots);
                    }}
                    checked={
                      timeSlots
                        .filter(slot => {
                          const hour = parseInt(slot.split(":")[0]);
                          return hour >= 0 && hour < 6;
                        })
                        .every(slot => selectedTimeSlots.includes(slot))
                    }
                  />
                  <label
                    htmlFor="dawn-all"
                    className="text-sm font-medium leading-none"
                  >
                    全選
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots
                  .filter(slot => {
                    const hour = parseInt(slot.split(":")[0]);
                    return hour >= 0 && hour < 6;
                  })
                  .map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        id={slot}
                        checked={selectedTimeSlots.includes(slot)}
                        onCheckedChange={(checked) =>
                          handleBulkTimeSlotChange(checked as CheckedState, [slot])
                        }
                      />
                      <label
                        htmlFor={slot}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot}
                      </label>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">上午 (06:00-11:59)</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="morning-all"
                    onCheckedChange={(checked) => {
                      const morningSlots = timeSlots.filter(slot => {
                        const hour = parseInt(slot.split(":")[0]);
                        return hour >= 6 && hour < 12;
                      });
                      handleBulkTimeSlotChange(checked, morningSlots);
                    }}
                    checked={
                      timeSlots
                        .filter(slot => {
                          const hour = parseInt(slot.split(":")[0]);
                          return hour >= 6 && hour < 12;
                        })
                        .every(slot => selectedTimeSlots.includes(slot))
                    }
                  />
                  <label
                    htmlFor="morning-all"
                    className="text-sm font-medium leading-none"
                  >
                    全選
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots
                  .filter(slot => {
                    const hour = parseInt(slot.split(":")[0]);
                    return hour >= 6 && hour < 12;
                  })
                  .map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        id={slot}
                        checked={selectedTimeSlots.includes(slot)}
                        onCheckedChange={(checked) =>
                          handleBulkTimeSlotChange(checked as CheckedState, [slot])
                        }
                      />
                      <label
                        htmlFor={slot}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot}
                      </label>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">下午 (12:00-17:59)</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afternoon-all"
                    onCheckedChange={(checked) => {
                      const afternoonSlots = timeSlots.filter(slot => {
                        const hour = parseInt(slot.split(":")[0]);
                        return hour >= 12 && hour < 18;
                      });
                      handleBulkTimeSlotChange(checked, afternoonSlots);
                    }}
                    checked={
                      timeSlots
                        .filter(slot => {
                          const hour = parseInt(slot.split(":")[0]);
                          return hour >= 12 && hour < 18;
                        })
                        .every(slot => selectedTimeSlots.includes(slot))
                    }
                  />
                  <label
                    htmlFor="afternoon-all"
                    className="text-sm font-medium leading-none"
                  >
                    全選
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots
                  .filter(slot => {
                    const hour = parseInt(slot.split(":")[0]);
                    return hour >= 12 && hour < 18;
                  })
                  .map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        id={slot}
                        checked={selectedTimeSlots.includes(slot)}
                        onCheckedChange={(checked) =>
                          handleBulkTimeSlotChange(checked as CheckedState, [slot])
                        }
                      />
                      <label
                        htmlFor={slot}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot}
                      </label>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">晚上 (18:00-23:59)</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="evening-all"
                    onCheckedChange={(checked) => {
                      const eveningSlots = timeSlots.filter(slot => {
                        const hour = parseInt(slot.split(":")[0]);
                        return hour >= 18;
                      });
                      handleBulkTimeSlotChange(checked, eveningSlots);
                    }}
                    checked={
                      timeSlots
                        .filter(slot => {
                          const hour = parseInt(slot.split(":")[0]);
                          return hour >= 18;
                        })
                        .every(slot => selectedTimeSlots.includes(slot))
                    }
                  />
                  <label
                    htmlFor="evening-all"
                    className="text-sm font-medium leading-none"
                  >
                    全選
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots
                  .filter(slot => {
                    const hour = parseInt(slot.split(":")[0]);
                    return hour >= 18;
                  })
                  .map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        id={slot}
                        checked={selectedTimeSlots.includes(slot)}
                        onCheckedChange={(checked) =>
                          handleBulkTimeSlotChange(checked as CheckedState, [slot])
                        }
                      />
                      <label
                        htmlFor={slot}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {slot}
                      </label>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
          {errors.availableTimeSlots && (
            <p className="text-red-500 text-sm mt-1">
              {errors.availableTimeSlots.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting || selectedTimeSlots.length === 0} 
          className="w-full"
        >
          {isSubmitting ? "處理中..." : "新增會議室"}
        </Button>
        {selectedTimeSlots.length === 0 && (
          <p className="text-red-500 text-sm mt-1 text-center">
            請至少選擇一個可用時段
          </p>
        )}
      </form>
    </div>
  );
} 