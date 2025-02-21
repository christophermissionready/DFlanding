import Image from 'next/image';
import dfimage from "./DFAlpha 2.png"

export default function Home() {
  return (
   <div className="prose text-center">
    <div className="flex justify-center">
      <Image src={dfimage} alt="DF Alpha 2" width={300} height={300} />
    </div>
    <p>
     This is demo is powered by{" "}
     <a href="https://nextjs.org/" className="underline">
      NEXT.JS
     </a>
    </p>
    <p>
     Read the{" "}
     <a href="/about" className="underline">
      Documentation
     </a>
    </p>
   </div>
  );
}
