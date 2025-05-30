'use client';
import {useState, useEffect} from 'react';
import { getSessionStorage } from './sessionStorage';


interface LogProps{
    className?: string;
    refreshCount: number;
}

interface Log{
    orderId: string;
    startStatus: number;
    endStatus: number;
    handlerID: string;
    handleTime: string; 
}

export default function LogPart({className, refreshCount}:LogProps){
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [logOrderid, setLogOrderid] = useState('');


    const logRequest = async () => {
        const userID = getSessionStorage('userid')
        const response = await fetch( '/api/log', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: userID,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
    }

    const handleMapping = (start: number, end:number) => {
        //对应工作流路径
        if(start === 0 && end === 1)
            return '工单创建';
        else if(start === 1 && end === 2)
            return '工单审批不通过';
        else if(start === 1 && end === 3)
            return '工单审批通过';
        else if(start === 3 && end === 3)
            return '转派工单给其他操作人员';
        else if(start === 3 && end === 4)
            return '提交操作结果';
    }

    const handleFilter = () => {
        const result = logs.filter( item => item.orderId === logOrderid);
        setFilteredLogs(result);
    }

    useEffect(() => {
        setLogOrderid('');
        logRequest();
    },[refreshCount]);

    return(
        <div className={className}>
            <div className="flex flex-row items-center justify-between p-2">
                <div>
                    <label htmlFor="orderid" >工单编号:</label>
                    <input id="orderid" className="custom-input text-black w-30 sm:w-40 md:w-45 lg:w-50" type="text" value={logOrderid} onChange={(e) => setLogOrderid(e.target.value)}/>
                </div>
                <button className="bg-sky-500 text-white px-4 py-1.5 w-20 rounded-lg hover:bg-sky-700 disabled:bg-sky-300 disabled:text-gray-300" disabled={ (logOrderid.length > 0) ? false : true } onClick={()=>handleFilter()}>查询</button>
            </div>
            <div className="h-[45px] w-full bg-gray-300 flex flex-row items-center justify-center text-xs sm:text-sm md:text-md lg:text-lg text-center gap-10 shadow-lg shadow-gray-500 shadow-opacity-10 z-1">
                <span className="text-black font-bold w-[30%]">工单编号</span>
                <span className="text-black font-bold w-[40%]">操作类型</span>
                <span className="text-black font-bold w-[30%]">操作时间</span>
            </div>
            <div className="h-full w-full flex items-center justify-center">
                { (filteredLogs.length > 0) ? (
                    <div className="h-full w-full flex flex-col p-1 overflow-y-scroll">
                        {filteredLogs.map((log,index) => (
                            <div className="h-[25px] w-full flex flex-row items-center justify-center text-xs sm:text-sm md:text-md lg:text-lg leading-3 text-center gap-10" key={index}>
                                <span className="text-sky-500 w-[30%]">{log.orderId}</span>
                                <span className="text-black w-[40%]">{handleMapping(log.startStatus,log.endStatus)}</span>
                                <span className="text-black w-[30%]">{log.handleTime}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <span className="text-red-700" >找不到相关的历史记录</span>
                    </div>
                )}
            </div>
        </div>
    );
}