"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  QrCode, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GetAppPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start lg:justify-center p-6 sm:p-8 py-12 sm:py-20 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-100/50 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-emerald-100/40 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Information */}
        <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium">
              Ứng dụng Chính thức
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Y tế <span className="text-teal-600">Bình Phú</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-xl">
              Chăm sóc sức khỏe toàn diện trong tầm tay. Đặt lịch khám, nhận kết quả và tư vấn từ xa ngay trên thiết bị Android của bạn.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-teal-100 group">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">Tiện lợi</h3>
                <p className="text-sm text-slate-500 line-clamp-2">Đặt lịch khám nhanh chóng 24/7.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-teal-100 group">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">An toàn</h3>
                <p className="text-sm text-slate-500 line-clamp-2">Bảo mật thông tin sức khỏe cá nhân.</p>
              </div>
            </div>
          </div>

          {/* Download Button (Mobile only view hidden on desktop) */}
          <div className="lg:hidden w-full flex flex-col gap-4">
            <a href="/app-release.apk" className="w-full">
              <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-teal-100 group">
                <Download className="mr-2 h-6 w-6 group-hover:animate-bounce" />
                Tải về Android (.APK)
              </Button>
            </a>
          </div>
        </div>

        {/* Right Side: Card & Instructions */}
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          <Card className="border-none shadow-2xl shadow-slate-200 overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Smartphone className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Phiên bản 1.0.0</CardTitle>
              </div>
              <CardDescription className="text-teal-50/80 font-medium">
                Cập nhật lần cuối: Tháng 4, 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Dung lượng:</span>
                  <span className="text-sm font-bold text-slate-900">~24 MB</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Yêu cầu:</span>
                  <span className="text-sm font-bold text-slate-900">Android 7.0+</span>
                </div>
              </div>

              <div className="hidden lg:block pt-4">
                <a href="/app-release.apk">
                  <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-teal-100 group">
                    <Download className="mr-2 h-6 w-6 group-hover:animate-bounce" />
                    Tải về (.APK)
                  </Button>
                </a>
                <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Ứng dụng đã được kiểm duyệt an toàn
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Installation Guide */}
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Info className="h-5 w-5 text-teal-600" />
              Hướng dẫn cài đặt
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-sm text-slate-600 italic">Nhấn vào nút <strong>Tải về</strong> phía trên để nhận tệp APK.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-sm text-slate-600 italic">Nếu trình duyệt cảnh báo, hãy chọn <strong>Vẫn tải xuống</strong>.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-sm text-slate-600 italic">Sau khi tải xong, hãy chọn <strong>Cài đặt</strong> để bắt đầu sử dụng.</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-none" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900">Lưu ý cho phiên bản Android mới</p>
                <p className="text-[10px] leading-relaxed text-amber-800">
                  Bạn có thể cần cho phép "Cài đặt ứng dụng từ nguồn không xác định" trong phần Cài đặt của thiết bị.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-slate-400 text-sm animate-in fade-in duration-1000 delay-500">
        &copy; 2026 Trạm Y Tế Phường Bình Phú. All rights reserved.
      </footer>
    </div>
  );
}
