// src/app/not-found.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/library/components/atoms/button";
import {
  Home,
  ArrowLeft
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className=" bg-white flex justify-center px-4">
      <div className="text-center">

        {/* Animated Search Icon */}
        <div className="mb-4">
          <Image
            src="/404-search.gif"
            alt="Page not found animation"
            width={400}
            height={400}
            className="mx-auto"
            unoptimized
          />
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-12">
          Sorry, this page was not found!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="px-8 py-3 shadow-none border-slate-200  hover:border-slate-300 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            BACK
          </Button>
          <Button
            asChild
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-300"
          >
            <Link href="/dashboard">
              <Home className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}