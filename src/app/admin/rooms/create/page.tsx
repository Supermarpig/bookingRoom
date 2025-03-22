"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { generate24HourTimeSlots } from "@/lib/utils";
import { createRoom } from "@/actions/room/create-room";
import { RoomSchema } from "@/types/schema";

// 移除不需要的字段
const CreateRoomSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

type CreateRoomInput = typeof CreateRoomSchema._type;

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

  const form = useForm<CreateRoomInput>({
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

      await createRoom(data);
      toast.success("會議室創建成功");
      router.push("/admin/rooms");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "創建會議室失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新增會議室</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>會議室名稱</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
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
                <FormLabel>圖片網址</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facilities"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>設施</FormLabel>
                  <FormDescription>選擇會議室提供的設施</FormDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {facilities.map((facility) => (
                    <FormField
                      key={facility}
                      control={form.control}
                      name="facilities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={facility}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(facility)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, facility])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== facility
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {facility}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
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
                  <Textarea {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availableTimeSlots"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>可用時段</FormLabel>
                  <FormDescription>選擇會議室可預約的時段</FormDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {timeSlots.map((slot) => (
                    <FormField
                      key={slot}
                      control={form.control}
                      name="availableTimeSlots"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={slot}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={selectedTimeSlots.includes(slot)}
                                onCheckedChange={(checked) => {
                                  const updatedSlots = checked
                                    ? [...selectedTimeSlots, slot].sort()
                                    : selectedTimeSlots.filter((s) => s !== slot);
                                  setSelectedTimeSlots(updatedSlots);
                                  field.onChange(updatedSlots);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{slot}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
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
              {isSubmitting ? "處理中..." : "新增會議室"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 