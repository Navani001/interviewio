"use client";
import React, { useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { ButtonComponent } from "../button";
import { Input } from "@heroui/react";

export const Login = () => {
  const [email, setEmail] = useState("");

  return (
    <div 
        className="text-white border-3 w-[70%] h-[80%] rounded-tl-[100px] rounded-br-[100px] p-8 bg-transparent blure-md backdrop-blur-[3px] border-[#0348d3]">
        <div className="flex items-center gap-1">
            <p className="text-4xl ">CRIME</p>
            <p 
                style={{
                    textShadow: "-1px -5px 3px black, 1px -1px 3px black, -1px 1px 3px black, 1px 1px 3px black",
                  }}
                className="text-6xl text-red-700 font-bold drop-shadow-2xl">X</p>
        </div>
        <div>
            <Input
                value={email}
                onValueChange={(val)=>setEmail(val)}
                required
                label="email"
                classNames={{
                    base:" border-2 border-[#0348d3]",
                    input:"outline-0 "
                }}

            />
            <Input label="Email" type="email" />
            
        </div>
    </div>
    
    
  );
};

export default Login;
