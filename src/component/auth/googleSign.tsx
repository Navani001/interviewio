"use client"
import { signIn } from "next-auth/react";
import React from "react";

export function GoogleSign() {
    return (
        <button onClick={() => signIn("google")} className="font-poppins text-red-900">Login with Google</button>
    );
}

