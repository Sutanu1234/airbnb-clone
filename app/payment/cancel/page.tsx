"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PaymentCancel = () => {
  const router = useRouter();

  useEffect(() => {
    toast.error("Payment was cancelled.");

    // Optionally redirect after toast
    const timer = setTimeout(() => {
      router.push("/"); // or go back to listing or bookings
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return <div className="p-8 text-center text-xl">Payment cancelled. Redirecting...</div>;
};

export default PaymentCancel;
