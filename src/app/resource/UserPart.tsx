'use client';
import {useRef , useState, useEffect} from 'react';
import { removeSessionStorage } from './sessionStorage';
import { useRouter } from 'next/navigation'; 

interface UserPartProps {
    className?: string,
    userName?: string,
}

export default function UserPart ({className , userName }: UserPartProps){
    const DialogRef = useRef<HTMLDialogElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    const Router = useRouter();

    //const Icon = getSessionStorage('usericon');
    const Iconpath = "../default.png";

    const Logout = () => {
        removeSessionStorage('userid');
        removeSessionStorage('username');
        removeSessionStorage('password');
        removeSessionStorage('usertype');
        removeSessionStorage('userdept');
        removeSessionStorage('usericon');
        Router.replace('/');
    }

    const Info = () => {
        Router.push('../info');
    }

    // 监听全局点击事件
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 当对话框打开且点击位置不在对话框内时
            if (isOpen &&DialogRef.current &&!DialogRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]); // 依赖项确保最新状态

   

    return(
        <>
            <button className={className} onClick={() => setIsOpen(true)}>
                <div className="w-12 h-12 rounded-full bg-gray-300" style={{ backgroundImage: `url(${Iconpath})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}/>
                <p className="text-black h-12 flex items-center">{userName}</p>
            </button>
            <dialog ref={DialogRef} open={isOpen} className="absolute left-5 top-20 w-[250px] h-[200px] bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 z-10">
                <div className="flex flex-col items-center justify-center py-2 gap-2 rounded-lg">
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden" style={{ backgroundImage: `url(${Iconpath})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}/>
                    <p className="text-black text-xl flex items-center">{userName}</p>
                </div>
                <div className="flex flex-row justify-center gap-1 py-1">
                    <button className="bg-sky-500 text-white px-4 py-2 w-30 rounded-lg hover:bg-sky-700" onClick={Info}>个人信息</button>
                    <button className="bg-white text-red-500 border-1 border-red-500 px-4 py-2 w-30 rounded-lg hover:border-red-700 hover:text-red-700 hover:bg-gray-300" onClick={Logout}>退出登录</button>             
                </div>
            </dialog>
        </>

    );
}