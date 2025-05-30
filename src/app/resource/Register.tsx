'use client';
import React , {useState,useRef} from 'react';

interface RegisterProps {
    className?: string;
}


export default function Register({className}: RegisterProps){
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userdept, setUserdept] = useState('个人');
    const [usertype, setUserType] = useState(1);

    const PromptRef = useRef<HTMLParagraphElement>(null);

    const validateUsername = (username: string) => {
        const regex = /^(?=.*[a-zA-Z])[a-zA-Z\d].{3,20}$/;
        return regex.test(username); 
    }

    const validatePassword = (password: string) => {
        // 定义密码验证的正则表达式
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
        return regex.test(password);
    }

    const registerRequest = async () => {
        const response = await fetch( '/api/register', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, usertype, userdept}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        PromptRef.current!.textContent = (await response.text()).toString();
    }

    const handleRegister = async () => {
        if(username==='')
        {
            PromptRef.current!.textContent = "用户名不能为空！"
            return;
        }
        else if(validateUsername(username)===false)
        {
            PromptRef.current!.textContent = "用户名需由4-20位数字/大小写字母组成且必须有大小写字母！"
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
        else if(userdept==='')
        {
            PromptRef.current!.textContent = "用户所属部门不能为空！"
            return;
        }
        else
        {
            await registerRequest();
        }
    }

    return(
        <div className={className}>
            <form className="flex flex-col justify-center gap-5" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                <div className="inline-block h-5">
                    <span className="text-red-700">*</span><label htmlFor="username" >用户名:</label>
                    <input id="username2" className="custom-input text-black" type="text" placeholder="4-20位数字/大小写字母" value={username} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}/>
                </div>
                <div className="inline-block h-5">
                    <span className="text-red-700">*</span><label htmlFor="password" >密码:</label>
                    <input id="password2" className="custom-input text-black" type="password" placeholder="8-32位的大小写字母和数字" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="inline-block h-5">
                    <span className="text-red-700">*</span><label htmlFor="confirmPassword">确认密码:</label>
                    <input id="confirmPassword2" className="custom-input text-black" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>
                <div className="inline-block h-5">
                    <span className="text-red-700">*</span><label htmlFor="userdept">所属部门:</label>
                    <input id="userdept2" className="custom-input text-black" type="text" placeholder="无所属部门，请填写为个人" value={userdept} onChange={(e) => setUserdept(e.target.value)}/>
                </div>
                <div className="inline-block h-5">
                    <span className="text-red-700">*</span><label htmlFor="usertype">用户角色:</label>
                    <select id="usertype2" className="custom-input text-black" value={usertype} onChange={(e) => setUserType(parseInt(e.target.value))}>
                        <option value="1">申请人</option>
                        <option value="2">审批人</option>
                        <option value="3">操作人</option>
                    </select>
                </div>
                <p ref={PromptRef} className="text-red-700 left-0 w-80" id="loginError"></p>
                <button className="bg-sky-500 text-white px-5 py-3 rounded-lg hover:bg-sky-700" type="submit">注册</button>
            </form>
            <p className="text-sky-500 left-0 text-sm">非运维人员，用户角色请填写为申请人</p>
        </div>
    );
}