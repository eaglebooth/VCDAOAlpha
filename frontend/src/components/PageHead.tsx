"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Reveal } from "./Reveal";
export function PageHead({kicker,title,copy}:{kicker:string;title:string;copy:string}){const router=useRouter();return <Reveal className="page-head"><button className="back-button" type="button" onClick={()=>router.back()} aria-label="Go back"><ArrowLeft size={18}/><span>Back</span></button><span>{kicker}</span><h1>{title}</h1><p>{copy}</p></Reveal>}
