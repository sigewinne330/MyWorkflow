'use client';
import React , {useState,useRef, useEffect} from 'react';
import { setSessionStorage } from './sessionStorage';
import { useRouter } from 'next/navigation';

interface LoginProps {
    className?: string;
}

export default function Login({className}: LoginProps){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usertype, setUsertype] = useState(0);

    const Router = useRouter();

    const PromptRef = useRef<HTMLParagraphElement>(null);

    const loginRequest = async () => {
        const response = await fetch( '/api/login', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        PromptRef.current!.textContent = (await response.text()).toString();
    }

    const infoRequest = async (queryString:string) => {
        const response = await fetch(`/api/info/${queryString}`, {
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
      
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userinfo = await response.json();
  
        setSessionStorage('userid',userinfo.userID);
        setSessionStorage('username',userinfo.userName);
        setSessionStorage('password',userinfo.password);
        setSessionStorage('usertype',userinfo.userType);
        setSessionStorage('userdept',userinfo.department);
        setSessionStorage('usericon',userinfo.userIcon);

        setUsertype( userinfo.userType === null ? 0 : parseInt(userinfo.userType));
    }

    const handleLogin = async () => {
        if( username==='')
        {
            PromptRef.current!.textContent = '用户名不能为空！';
            return ;
        }
        else if(password==='')
        {
            PromptRef.current!.textContent = '密码不能为空！';
            return ;
        }
        else
        {
            await loginRequest();
            if(PromptRef.current!.textContent === '')
            {    
                await infoRequest(username);
                return ;
            }
            return ;
        }
    }

    useEffect(() => {
        if(usertype === 1)
            Router.replace('../applicator');
        else if(usertype === 2)
            Router.replace('../approver');
        else if(usertype === 3)
            Router.replace('../handler');
    },[usertype,Router]);

    return(
        <div className={className}>
            <form className="flex flex-col justify-center gap-5" onSubmit={(e) => { e.preventDefault(); handleLogin();}}>
                <div className="inline-block h-10">
                    <label htmlFor="username" >用户名:</label>
                    <input id="username1" className="custom-input text-black" type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}/>
                </div>
                <div className="inline-block h-10">
                    <label htmlFor="password" >密码:</label>
                    <input id="password1" className="custom-input text-black" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <p ref={PromptRef} className="text-red-700 left-0" id="loginError"></p>
                <button className="bg-sky-500 text-white px-5 py-3 rounded-lg hover:bg-sky-700" type="submit">登录</button>
            </form>
        </div>
    );

}