"use client"

import { Button } from "./ui/button";
import { Plus, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    role: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
    };
  } | null;
  currentPage?: "home" | "assessment" | "admin";
}

export function Header({ user, currentPage = "home" }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  // Debug logging
  useEffect(() => {
    console.log("=== Header Debug Info ===");
    console.log("User object:", user);
    console.log("User role:", user?.role);
    console.log("Current page:", currentPage);
    console.log("Show admin button:", user && user.role === 'admin' && currentPage !== 'admin');
    console.log("Show assessment button:", user && (user.role === 'panel' || user.role === 'admin') && currentPage === "home");
    console.log("========================");
  }, [user, currentPage]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleNavigateHome = () => {
    router.push('/');
  };

  const handleNavigateAssessment = () => {
    router.push('/assessment/new');
  };

  const handleNavigateAdmin = () => {
    router.push('/admin');
  };

  // Get user display info
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
  };

  const getUserInitial = () => {
    if (!user) return 'G';
    const displayName = getUserDisplayName();
    return displayName[0].toUpperCase();
  };

  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E5E5E5]">
      <div className="px-4 md:px-20 h-16 flex items-center justify-between">
        <button 
          onClick={handleNavigateHome}
          className="text-[24px] leading-[32px] font-bold text-[#111111] hover:opacity-70 transition-opacity"
        >
          tea_db
        </button>
        
        <div className="flex items-center gap-3">
          {user && user.role === 'admin' && currentPage !== 'admin' && (
            <Button
              onClick={handleNavigateAdmin}
              variant="outline"
              className="rounded-[10px] border-[#E5E5E5] hover:bg-[#F7F7F7] text-[14px] leading-[22px]"
            >
              관리자
            </Button>
          )}
          
          {user && (user.role === 'panel' || user.role === 'admin') && currentPage === "home" && (
            <Button
              onClick={handleNavigateAssessment}
              variant="outline"
              className="rounded-[10px] border-[#E5E5E5] hover:bg-[#F7F7F7] text-[14px] leading-[22px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              품평 작성하기
            </Button>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              {/* User Info Display */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[12px] leading-[18px] text-[#111111] font-medium">
                  {getUserDisplayName()}
                </span>
                <span className="text-[10px] leading-[16px] text-[#666666]">
                  {user.email}
                </span>
              </div>
              
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#E5E5E5] flex items-center justify-center overflow-hidden">
                {getAvatarUrl() ? (
                  <Image
                    src={getAvatarUrl()!}
                    alt={getUserDisplayName()}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[14px] text-[#666666] font-medium">
                    {getUserInitial()}
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="rounded-[10px] border-[#E5E5E5] hover:bg-[#F7F7F7]"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="rounded-[10px] border-[#E5E5E5] hover:bg-[#F7F7F7] text-[14px] leading-[22px]"
            >
              <div className="w-5 h-5 rounded-full bg-[#E5E5E5] mr-2 flex items-center justify-center">
                <span className="text-[10px] text-[#666666]">G</span>
              </div>
              Continue with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
