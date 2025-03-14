"use client"
import { signIn } from "next-auth/react";
import React from "react";

export function GoogleSign() {
    return (
        <button onClick={() => signIn("google")}>Login with Google</button>
    );
}

