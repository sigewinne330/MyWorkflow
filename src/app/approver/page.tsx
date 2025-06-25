'use client';
import React,{useRef,useState,useEffect} from "react";
import { useRouter } from 'next/navigation';
import UserPart from "../resource/UserPart";
import { getSessionStorage } from "../resource/sessionStorage";
import DetailPart from "../resource/DetailPart";
import StatisticPart from "../resource/StatisticPart";
import LogPart from "../resource/LogPart";

interface OrderBriefInfo {
    orderid: string;
    urgency: number;
    applytime: string;
}

interface Handlers {
    userid: string;
    userdept: string;
}


export default function Approver() {
    const Router = useRouter();

    const ListButton = useRef<HTMLButtonElement>(null);
    const HistoryButton = useRef<HTMLButtonElement>(null);
    const ListTab = useRef<HTMLDivElement>(null);
    const HistoryTab = useRef<HTMLDivElement>(null);
    const HandlerRef = useRef<HTMLSelectElement>(null);

    const setListTab = () => {
        ListButton.current!.classList.add('app_tab_selected');
        ListButton.current!.classList.remove('app_tab_normal');
        HistoryButton.current!.classList.add('app_tab_normal');
        HistoryButton.current!.classList.remove('app_tab_selected');
        HistoryTab.current!.style.visibility = "hidden";
        ListTab.current!.style.visibility = "visible";
    }
    const setHistoryTab = () => {
        ListButton.current!.classList.add('app_tab_normal');
        ListButton.current!.classList.remove('app_tab_selected');
        HistoryButton.current!.classList.add('app_tab_selected');
        HistoryButton.current!.classList.remove('app_tab_normal');
        ListTab.current!.style.visibility = "hidden";
        HistoryTab.current!.style.visibility = "visible";
    }

    const [refreshCount, setRefreshCount] = useState(0);//用于定时刷新
    const [username, setUsername] = useState('');
    const [content, setContent] = useState('');
    const [isapproved, setIsapproved] = useState(3);
    const [handlers, setHandlers] = useState<Handlers[]>([]);
    const [todo, setTodo] = useState<OrderBriefInfo[]>([]);
    const [currentOrder, setCurrentOrder] = useState('');
    const maxLength = 500;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= maxLength) {
          setContent(input);
        }
    };

    const handleIsapproved = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const input = e.target.value; 
        setIsapproved(parseInt(input));
    };

    const handleCommit = (status: number) => {
        if(status === 2)
            rejectRequest();
        else if(status === 3)
            passRequest();
        else
            return;
    }

    const getOrdertype = (urgency: number) => {
        switch(urgency){
            case 1: return '紧急申请';
            case 2: return '重要申请';
            case 3: return '常规申请';
            default: return '';
        }
    }

    const getUrgencyColor = (urgency: number) => {
        switch(urgency){
            case 1: return 'red';
            case 2: return 'orange';
            case 3: return '#22c55e';
            default: return 'black';
        }
    }

    function isWarning(inputStr: string) {
        // 解析输入时间
        const [datePart, timePart] = inputStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
      
        const inputDate = new Date(year, month - 1, day, hours, minutes, seconds);
      
        // 当前时间（若isUTC为true，使用UTC时间戳）
        const now = new Date().getTime();
        const inputTime = inputDate.getTime();
      
        // 计算差异
        const diffMs = now - inputTime;
        const threeHoursMs = 24 * 60 * 60 * 1000;
      
        return Math.abs(diffMs) > threeHoursMs;
    }

    const handlersRequest = async () => {
        const response = await fetch( '/api/handlers', {
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

        const data = await response.json();
        setHandlers(data);
    }

    const todoRequest = async () => {
        const userID = getSessionStorage('userid')
        const response = await fetch( '/api/approvertodo', {
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
        setTodo(data);
    }

    const getDetails = (orderID: string) => {
        setCurrentOrder(orderID);
    }

    const passRequest = async () => {
        const approverid = getSessionStorage('userid');
        const orderid = currentOrder;
        const handlerid = HandlerRef.current!.value;

        const response = await fetch( '/api/pass', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ approverid, orderid , handlerid }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.text()).toString();

        setCurrentOrder('');
        setRefreshCount(prev => prev + 1);
        window.alert(data);
    }

    const rejectRequest = async () => {
        const userid = getSessionStorage('userid');
        const orderid = currentOrder;
        const result = content;

        const response = await fetch( '/api/reject', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userid, orderid , result }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.text()).toString();

        setContent('');
        setCurrentOrder('');
        setRefreshCount(prev => prev + 1);
        window.alert(data);
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
        const hasSession = sessionStorage.getItem('username');
        
        // 如果不存在 session，则重定向到根路径
        if (hasSession === null) {
          Router.replace('/');
          return;
        }
        else if (sessionStorage.getItem('usertype')!.toString()!=="2"){
            Router.back();
        }
        else {
            setUsername(hasSession);
        }
        todoRequest();
        handlersRequest();
    }, [refreshCount,Router]);

    return(
    <div className="w-screen h-screen bg-sky-100 overflow-y-scroll">
        <div className="w-full h-[70px] flex items-center justify-between bg-sky-300 z-2 sticky top-0 shadow-sm shadow-gray-500 shadow-opacity-1">
            <UserPart className="left-5 absolute inset-0 w-[250px] h-[60px] px-1 py-2 hover:scale-105 transition duration-300 flex flex-row gap-2 justify-center" userName={username}/>
        </div>
        <div className="w-full h-[200vh] flex flex-col gap-3 px-5 py-2">
            <div className="w-full h-[20vh] bg-white flex flex-row gap-10 items-center justify-center rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10">
                <button ref={ListButton} onClick={setListTab} className="app_tab_selected h-15 w-30">我的待办（{todo.length}）</button>
                <button ref={HistoryButton} onClick={setHistoryTab} className="app_tab_normal h-15 w-30">历史记录</button>
            </div>
            <div className="w-full h-full relative flex flex-col items-center">
                <div ref={ListTab} className="w-full h-full absolute inset-0 bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 p-2" style={{ visibility: 'visible' }}>
                    <div className="h-full w-full flex items-center justify-center">
                        { (todo.length > 0) ? ( 
                            <div className="h-full w-full rounded-lg flex flex-col p-1 overflow-y-scroll">
                                {todo.map((briefOrder,index) => (
                                    <button className="h-[40px] w-full flex flex-row items-center justify-center gap-10 p-1 my-1 shadow-lg shadow-gray-300 shadow-opacity-10 brightness-100 hover:brightness-90" style={{backgroundColor: isWarning(briefOrder.applytime) ? '#fecaca' : 'white'}} key={index} onClick={()=>getDetails(briefOrder.orderid)}>
                                        <span className="text-sky-500 text-sm sm:text-md md:text-lg lg:text-xl w-[30%]">{briefOrder.orderid}</span>
                                        <span className="text-sm sm:text-md md:text-lg lg:text-xl font-bold w-[30%]" style={{color: getUrgencyColor(briefOrder.urgency) }}>{getOrdertype(briefOrder.urgency)}</span>
                                        <span className="text-black text-sm sm:text-md md:text-lg lg:text-xl leading-4 w-[40%]">{briefOrder.applytime}</span>
                                    </button>
                                ))}
                            </div>) : (
                            <div className="flex items-center justify-center">
                                <span className="text-red-700" >您当前暂时没有待审批的工单</span>
                            </div>
                        )}  
                    </div>   
                </div>
                <div ref={HistoryTab} className="w-full h-full absolute inset-0 bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 p-2 flex flex-col items-center" style={{ visibility: 'hidden' }}>
                    <StatisticPart className="h-[60px] w-full flex flex-col gap-2" userType={2} refreshCount={refreshCount}/>
                    <LogPart className="h-full w-full flex flex-col" refreshCount={refreshCount}/>    
                </div>
            </div>
            <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-2 rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 z-1">
                <DetailPart className="w-[90%] relative bg-white p-2 border-1 border-sky-700 rounded-lg min-h-[300px] h-[65%] flex items-center justify-center" orderId={currentOrder} userType={2}/>          
                <div className="w-[90%] h-[200px] flex flex-col items-center justify-center gap-2">
                    <div className="w-full flex flex-row items-center">
                        <span className="text-red-700">*</span><label htmlFor="isapproved" >审批结果:</label>
                        <select id="isapproved" className="border-1 border-sky-700 focus:outline-none focus:border-sky-500 resize-none rounded-sm text-black h-8 w-20 overflow-x-hidden overflow-y-auto" value={isapproved} onChange={(e) => handleIsapproved(e)}>
                            <option value={3}>通过-3</option>
                            <option value={2}>拒绝-2</option>
                        </select>
                    </div>
                    <div className="w-full h-[140px] relative flex flex-col items-center">
                        <div className="absolute w-full h-full inset-0" style={{visibility: (isapproved === 3) ? 'visible' : 'hidden'}}>
                            <span className="text-red-700">*</span><label htmlFor="handler" >转派给:</label><br/>
                            <select id="handler" ref={HandlerRef} className="border-1 p-1 border-sky-700 focus:outline-none focus:border-sky-500 resize-none rounded-sm text-black h-8 w-full overflow-x-hidden overflow-y-auto">
                            {handlers.map((handler,index) => (
                                <option value={handler.userid} key={index} >{handler.userid};{handler.userdept}</option>
                            ))}
                            </select>
                        </div>
                        <div className="absolute w-full h-full inset-0" style={{ visibility: (isapproved === 2) ? 'visible' : 'hidden'}}>
                            <span className="text-red-700">*</span><label htmlFor="result" >拒绝原因:</label><br/>
                            <textarea id="result" className="border-1 p-1 border-sky-700 focus:outline-none focus:border-sky-500 resize-none rounded-sm text-black h-20 w-full overflow-x-hidden overflow-y-auto" value={content} onChange={(e) => handleChange(e)}/>
                            <p className="text-sky-500 left-0" id="loginError">（{content.length}/{maxLength}）</p>
                        </div>
                    </div>
                    <button className="bg-sky-500 text-white px-4 py-2 w-40 rounded-lg hover:bg-sky-700 disabled:bg-sky-300 disabled:text-gray-300" disabled={((isapproved === 2 && content.length === 0) || currentOrder === '') ? true : false} onClick={ () => handleCommit(isapproved) }>提交审批结果</button>
                </div>
            </div>
            
        </div>
    </div>
    );
}