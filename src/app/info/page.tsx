'use client'
import {useEffect, useRef, useState} from 'react';
import { useRouter } from 'next/navigation';

export default function Info () {
    const Router = useRouter();

    const [refreshCount, setRefreshCount] = useState(0);//用于定时刷新
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userdept, setUserdept] = useState('');
    const [usertype, setUsertype] = useState(0);

    const NamePromptRef = useRef<HTMLParagraphElement>(null);
    const PasswordPromptRef = useRef<HTMLParagraphElement>(null);
    const DeptPromptRef = useRef<HTMLParagraphElement>(null);

    const validateUsername = (username: string) => {
        const regex = /^(?=.*[a-zA-Z])[a-zA-Z\d].{3,20}$/;
        return regex.test(username); 
    }

    const validatePassword = (password: string) => {
        // 定义密码验证的正则表达式
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
        return regex.test(password);
    }

    const infoModifyRequest = async (type: string) => {
        const userid = sessionStorage.getItem('userid');
        const modifytype = type;
        let value;
        switch(type) {
            case 'username': value = username; break;
            case 'password': value = password; break;
            case 'userdept': value = userdept; break;
            default: value = '';break;
        };

        const response = await fetch( '/api/modifyinfo', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userid, modifytype, value }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        switch(type) {
            case 'username': NamePromptRef.current!.textContent = (await response.text()).toString(); break;
            case 'password': PasswordPromptRef.current!.textContent = (await response.text()).toString(); break;
            case 'userdept': DeptPromptRef.current!.textContent = (await response.text()).toString();break;
            default: break;
        };
    }

    const modifyName = () => {
        if(username==='')
        {
            NamePromptRef.current!.textContent = "用户名不能为空！"
            return;
        }
        else if(validateUsername(username)===false)
        {
            NamePromptRef.current!.textContent = "用户名需由4-20位数字/大小写字母组成且必须有大小写字母！"
            return;
        }
        else
        {
            infoModifyRequest('username');
        }
    }

    const modifyPassword = () => {
        if(password==='')
        {
            PasswordPromptRef.current!.textContent = "密码不能为空！"
            return;
        }
        else if(validatePassword(password)===false)
        {
            PasswordPromptRef.current!.textContent = "密码需由8-32位的大小写字母和数字组成！"
            return;
        }
        else if(password!=confirmPassword)
        {
            PasswordPromptRef.current!.textContent = "确认密码应与设定密码一致！"
            return;
        }
        else
        {
            infoModifyRequest('password');
        }
    }
    
    const modifyDept = () => {
        if(userdept==='')
        {
            DeptPromptRef.current!.textContent = "用户所属部门不能为空！"
            return;
        }
        else
        {
           infoModifyRequest('userdept'); 
        }
    }

    const mapUsertype = () => {
        if(usertype === 1)
            return '申请人';
        else if(usertype===2)
            return '审批人';
        else if(usertype===3)
            return '处理人';
        else
            return '0'; 
    }

    const back = () => {
        Router.back();
    }

    useEffect(() => {
        //每隔1min定时刷新
        const intervalId = setInterval(() => {
          setRefreshCount(prev => prev + 1);
        }, 60000); 
    
        return () => clearInterval(intervalId);

      }, []); 

    useEffect(() => {
        // 检查 sessionStorage 中是否存在指定的 key
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');
        const usertype = sessionStorage.getItem('usertype');
        const userdept = sessionStorage.getItem('userdept');
        
        // 如果不存在 session，则重定向到根路径
        if (!(username && password && usertype && userdept)) {
          Router.replace('/');
          return;
        }
        else {
            setName(username);
            setPassword(password);
            setUsertype(parseInt(usertype));
            setUserdept(userdept);
        }
    },[refreshCount,Router]);


    return(
    <div className="w-screen h-screen bg-sky-100 flex items-center justify-center overflow-y-scroll">
        <div className="flex flex-col items-center justify-center bg-white w-[400px] h-[600px] rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 overflow-hidden gap-">      
            <h1 className="text-sky-500 text-2xl m-2 border-b-2 border-sky-500">用户信息</h1>
            <div className="w-[80%] h-[80%] flex flex-col justify-center gap-1">
                <div className="inline-block h-10">
                    <label htmlFor="username" >用户名:</label>
                    <input id="username" className="w-50 custom-input text-black" type="text" placeholder="4-20位数字/大小写字母" value={username} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}/>
                </div>
                <button className="w-20 bg-sky-500 text-white px-5 py-2 rounded-lg hover:bg-sky-700" onClick={modifyName}>修改</button>
                <p ref={NamePromptRef} className="text-red-700 left-0 w-80" />
                <div className="inline-block h-10">
                    <label htmlFor="password" >密码:</label>
                    <input id="password" className="w-50 custom-input text-black" type="password" placeholder="8-32位的大小写字母和数字" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="inline-block h-10">
                    <label htmlFor="confirmPassword">确认密码:</label>
                    <input id="confirmPassword" className="w-50 custom-input text-black" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>
                <button className="w-20 bg-sky-500 text-white px-5 py-2 rounded-lg hover:bg-sky-700" onClick={modifyPassword}>修改</button>
                <p ref={PasswordPromptRef} className="text-red-700 left-0 w-80" />
                <div className="inline-block h-10">
                    <label htmlFor="userdept">所属部门:</label>
                    <input id="userdept" className="w-50 custom-input text-black" type="text" placeholder="无所属部门，请填写为个人" value={userdept} onChange={(e) => setUserdept(e.target.value)}/>
                </div>
                <button className="w-20 bg-sky-500 text-white px-5 py-2 rounded-lg hover:bg-sky-700" onClick={modifyDept}>修改</button>
                <p ref={DeptPromptRef} className="text-red-700 left-0 w-80" />
                <div className="inline-block h-10">
                    <label htmlFor="usertype">用户角色:</label>
                    <input id="usertype" className="w-50 custom-input text-black" value={mapUsertype()} disabled={true}/>
                </div>
                <div className="w-full flex items-center justify-center">
                    <button className="bg-sky-500 text-white w-50 px-5 py-3 rounded-lg hover:bg-sky-700" onClick={back}>返回</button>
                </div>
            </div>
        </div>
    </div>
    );
}