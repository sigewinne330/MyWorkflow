'use client';
import React , {useState,useRef} from 'react';

interface RegisterProps {
    className?: string;
}


export default function Register({className}: RegisterProps){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const PromptRef = useRef<HTMLParagraphElement>(null);

    const validatePassword = (password: string) => {
        // 定义密码验证的正则表达式
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
        return regex.test(password);
    }

    const forgetRequest = async () => {
        const response = await fetch( '/api/forget', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        PromptRef.current!.textContent = (await response.text()).toString();
    }

    const handleForget = async () => {
        if(username==='')
        {
            PromptRef.current!.textContent = "用户名不能为空！"
            return;
        }
        else if(password==='')
        {
            PromptRef.current!.textContent = "密码不能为空！"
            return;
        }
        else if(validatePassword(password)===false)
        {
            PromptRef.current!.textContent = "密码需由8-32位的大小写字母和数字组成！"
            return;
        }
        else if(password!=confirmPassword)
        {
            PromptRef.current!.textContent = "确认密码应与设定密码一致！"
            return;
        }
        else
        {
            await forgetRequest();
        }
    }


    return(
        <div className={className}>
            <form className="flex flex-col justify-center gap-5" onSubmit={(e) => { e.preventDefault(); handleForget(); }}>
                <div className="inline-block h-8">
                    <label htmlFor="username3" >用户名:</label>
                    <input id="username" className="custom-input text-black" type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className="inline-block h-8">
                    <label htmlFor="password3" >密码:</label>
                    <input id="password" className="custom-input text-black" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="inline-block h-8">
                    <label htmlFor="confirmPassword">确认密码:</label>
                    <input id="confirmPassword3" className="custom-input text-black" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>
                <p ref={PromptRef} className="text-red-700 left-0" id="Error"></p>
                <button className="bg-sky-500 text-white px-5 py-3 rounded-lg hover:bg-sky-700" type="submit">重置密码</button>
            </form>
        </div>
    );
}