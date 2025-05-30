'use client';
import {useState, useEffect} from 'react';

interface ProgressProps {
    className?: string;
    orderID?: string;
}

export default function Progress({className, orderID}:ProgressProps){


    const [status, setStatus] = useState(0);

    const statusRequest = async () => {
        const response = await fetch( '/api/status', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: orderID,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = parseInt(await response.text());
        setStatus(data);
    }

    useEffect(() => {
        if(orderID === '')
            setStatus(0);
        else
            statusRequest();
    },[orderID,statusRequest]);


    return(
        <div className={className}>
            <div className="relative w-full h-full flex flex-row items-center justify-center text-black">
                <div className="w-30 h-30 flex flex-col items-center justify-center gap-2" style={{color: (status > 0)? '#22c55e' : 'gray'}}>
                    <div className="border-1 rounded-full h-15 w-15 flex items-center justify-center">
                        <span className="text-2xl">1</span>
                    </div>
                    <span>提交申请</span>
                </div>
                <div className="w-10 h-30 flex flex-col items-center justify-center gap-2" style={{color: (status > 0)? '#22c55e' : 'gray'}}>
                    <span className="text-3xl h-15">——</span>
                    <span></span>
                </div>
                <div className="w-30 h-30 flex flex-col items-center justify-center gap-2" style={{color: (status > 1)? ((status > 2)? '#22c55e' : 'red') : 'gray'}}>
                    <div className="border-1 rounded-full h-15 w-15 flex items-center justify-center">
                        <span className="text-2xl">2</span>
                    </div>
                    <span>通过审批</span>
                </div>
                <div className="w-10 h-30 flex flex-col items-center justify-center gap-2" style={{color: (status > 2)? '#22c55e' : 'gray'}}>
                    <span className="text-3xl h-15">——</span>
                    <span></span>
                </div>
                <div className="w-30 h-30 flex flex-col items-center justify-center gap-2" style={{color: (status > 3)? '#22c55e' : 'gray'}}>
                    <div className="border-1 rounded-full h-15 w-15 flex items-center justify-center">
                        <span className="text-2xl">3</span>
                    </div>
                    <span>处理完成</span>
                </div>
            </div>
        </div>
    );
}