'use client';
import {useState, useEffect} from 'react';
import { getSessionStorage } from './sessionStorage';

interface StatisticProps{
    className?: string;
    userType: number;
    refreshCount: number;
}

interface StatusSet{
    type: string;
    mode: string;
    endstatus: number;
}

export default function StatisticPart ({className,userType,refreshCount}:StatisticProps){
    const [statusset, setStatusset] = useState<StatusSet[]>([]);

    useEffect(() => {
        if(userType === 3){
            setStatusset([
                { type:'今日处理', mode:'daily', endstatus:4 },
                { type:'今日转派', mode:'daily', endstatus:3 },
                { type:'本周处理', mode:'weekly', endstatus:4 },
                { type:'本周转派', mode:'weekly', endstatus:3 }]);
        }
        else if(userType === 2){
            setStatusset([
                { type:'今日审批通过', mode:'daily', endstatus:3 },
                { type:'今日审批不通过', mode:'daily', endstatus:2 },
                { type:'本周审批通过', mode:'weekly', endstatus:3 },
                { type:'本周审批不通过', mode:'weekly', endstatus:2 }]);
        } 
    },[userType]);

    

    return(
        <div className={className}>
            <div className="flex flex-row justify-center items-center">
                {statusset.map((item,index) => (
                    <div className="flex flex-col justify-center items-center w-[150px]" key={index}>
                        <p className="text-black text-xs sm:text-sm md:text-md lg:text-lg">{item.type}</p>
                        <ValuePart className="text-red-700 text-2xl md:text-3xl" endStatus={item.endstatus} mode={item.mode} refreshCount={refreshCount}/>
                    </div>   
                ))}
            </div>
        </div>
    );
}

interface ValueProps{
    className?: string;
    endStatus: number;
    mode: string;
    refreshCount: number;
}

function ValuePart({className, endStatus, mode, refreshCount}:ValueProps){
    const [value, setValue] = useState(0);

    const countRequest = async () => {
        const userid = getSessionStorage('userid');
        const endstatus = endStatus;
        const response = await fetch( '/api/taskcount', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userid, mode, endstatus }),
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = (await response.text()).toString();
        setValue(parseInt(data));
    } 

    useEffect(() => {
        countRequest();
    },[refreshCount,countRequest]);


    return(
        <p className={className}>
            {value}
        </p>
    );
}