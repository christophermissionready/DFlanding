'use client';

import Image from 'next/image';
import dfimage from "./DFAlpha 2.png"
import {useState} from "react";


export default function Home() {
  const [count, setCount] = useState(1); //Current fib number
  const [prevCount, setPrevCount] = useState(1); //Previous fib number
  return (
   <>

   <div className='flex justify-center items-center w-2/3'>
    <div className="h-screen flex items-center justify-center">
    <div className="prose text-center">
      <div className="flex justify-center">
        <Image src={dfimage} alt="DF Alpha 2" width={300} height={300} />
      </div>
      <p>
        This is demo is powered by{" "}
        <a href="https://nextjs.org/" className="underline">
        Next.js
        </a>
      </p>
      <p>
        Read the{" "}
        <a href="/about" className="underline">
        Documentation
        </a>
      </p>
      Click{" "}
      <button type="button" onClick={() => {
        const nextNumber = count+prevCount;
        setPrevCount(count);
        setCount(nextNumber);
      }}>
        <span className="underline">HERE</span>
      </button>
      {" "}to see the next Fibonnaci number: 
      <br/>
      {count} 
    </div>
  </div>
  <div>
    <h1>Chatscreen side</h1>
  

  </div></div>
   
    
   </>
  );
}
