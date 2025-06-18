"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    toast.success("Reservation completed successfully!");

    // Optionally redirect after toast
    const timer = setTimeout(() => {
      router.push("/trips"); // or your booking dashboard
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return <div className="p-8 text-center text-xl">Redirecting...</div>;
};

export default PaymentSuccess;
