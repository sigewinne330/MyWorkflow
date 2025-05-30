'use client';
import anime from 'animejs';
import Login from "@/app/resource/Login";
import Register from "@/app/resource/Register";
import Forget from "@/app/resource/Forget";
import { useRef, useEffect } from "react";

export default function Home() {
  const LoginRef = useRef<HTMLDivElement>(null);
  const RegisterRef = useRef<HTMLDivElement>(null);
  const ForgetRef = useRef<HTMLDivElement>(null);
  const LoginButton = useRef<HTMLButtonElement>(null);
  const RegisterButton = useRef<HTMLButtonElement>(null);
  const ForgetButton = useRef<HTMLButtonElement>(null);

  const chooseLogin = () => {
    LoginButton.current!.classList.add('index_tab_selected');
    LoginButton.current!.classList.remove('index_tab_normal');
    RegisterButton.current!.classList.add('index_tab_normal');
    RegisterButton.current!.classList.remove('index_tab_selected');
    ForgetButton.current!.classList.add('index_tab_normal');
    ForgetButton.current!.classList.remove('index_tab_selected');
    RegisterRef.current!.style.visibility = "hidden";
    ForgetRef.current!.style.visibility = "hidden";
    LoginRef.current!.style.visibility = "visible";
  }

  const chooseRegister = () => {
    LoginButton.current!.classList.add('index_tab_normal');
    LoginButton.current!.classList.remove('index_tab_selected');
    RegisterButton.current!.classList.add('index_tab_selected');
    RegisterButton.current!.classList.remove('index_tab_normal');
    ForgetButton.current!.classList.add('index_tab_normal');
    ForgetButton.current!.classList.remove('index_tab_selected');
    LoginRef.current!.style.visibility = "hidden";
    ForgetRef.current!.style.visibility = "hidden";
    RegisterRef.current!.style.visibility = "visible";
  }

  const chooseForget = () => {
    LoginButton.current!.classList.add('index_tab_normal');
    LoginButton.current!.classList.remove('index_tab_selected');
    RegisterButton.current!.classList.add('index_tab_normal');
    RegisterButton.current!.classList.remove('index_tab_selected');
    ForgetButton.current!.classList.add('index_tab_selected');
    ForgetButton.current!.classList.remove('index_tab_normal');
    LoginRef.current!.style.visibility = "hidden";
    RegisterRef.current!.style.visibility = "hidden";
    ForgetRef.current!.style.visibility = "visible";
  }

  useEffect(() => {
    const animation = anime({
      targets: '.idxmodel',
      opacity: [0, 1],
      translateY: [100, 0],
      easing: 'easeInOutSine',
      duration: 1000,
    });
    animation.play();
  }, []);

  return (
    <div className="w-screen h-screen bg-sky-100 flex items-center justify-center overflow-y-scroll">
      <div className="idxmodel bg-white w-[400px] h-[600px] rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 overflow-hidden">
        <div className="flex flex-col">
          <div className="w-full h-[200px] flex items-center justify-center" style={{ backgroundImage: 'url(/login.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <p className="relative text-black text-4xl z-10 text-center">欢迎使用<br/>运维工单管理系统</p>
          </div>
          <div className="w-full h-[400px] bg-white">
            <div className="flex flex-row items-center justify-center gap-5 h-15">
              <button ref={LoginButton} onClick={chooseLogin} className="bg-white px-5 py-3 index_tab_selected transition duration-300">用户登录</button>
              <button ref={RegisterButton} onClick={chooseRegister} className="bg-white px-5 py-3 index_tab_normal transition duration-300">用户注册</button>
              <button ref={ForgetButton} onClick={chooseForget} className="bg-white px-5 py-3 index_tab_normal transition duration-300">忘记密码</button>
            </div>
            <div className="flex flex-col justify-center items-center gap-5 bg-white h-85">
              <div ref={LoginRef} className="tab absolute transition duration-0" style={{ visibility: 'visible' }}>
                <Login className="w-[100%] h-[100%]"/>
              </div>
              <div ref={RegisterRef} className="tab absolute transition duration-0" style={{ visibility: 'hidden' }}>
                <Register className="w-[100%] h-[100%]"/>
              </div>
              <div ref={ForgetRef} className="tab absolute transition duration-0" style={{ visibility: 'hidden' }}>
                <Forget className="w-[100%] h-[100%]"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
