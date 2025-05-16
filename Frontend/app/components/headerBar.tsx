import ldIcon from './ldIcon.svg';
import { useRouter } from "next/navigation";

type HeadButtonProps = {
    name: string;
    name1: string;
    name2: string;
  };
  
  export default function headButton({ name, name1, name2 }: HeadButtonProps) {
    const router = useRouter();
    return(
      <div className="flex items-center justify-between p-4 font-coolvetica bg-black">
      <img src={ldIcon.src} alt="Logo" className="w-50" />
      <div className="flex space-x-4">
        <button onClick={() => router.push("/")} className="text-xl cursor-pointer tracking-wider mr-10 text-white m-3 transition-opacity duration-400 opacity-100 hover:opacity-40">{name}</button>
        <button onClick={() => router.push("/licensing")} className="text-xl cursor-pointer tracking-wider mr-10 text-white m-3 transition-opacity duration-400 opacity-100 hover:opacity-40">{name2}</button>
      </div>
      </div>
    );
  }