'use client';
import React,{useRef,useState,useEffect} from "react";
import { getSessionStorage } from '../resource/sessionStorage';
import { useRouter } from 'next/navigation';
import UserPart from "../resource/UserPart";
import DetailPart from "../resource/DetailPart";
import LogPart from "../resource/LogPart";
import StatisticPart from "../resource/StatisticPart";

interface OrderBriefInfo {
    orderid: string;
    urgency: number;
    applytime: string;
}

interface Handlers {
    userid: string;
    userdept: string;
}


export default function Handler() {
    const Router = useRouter();

    const OrderButton = useRef<HTMLButtonElement>(null);
    const HistoryButton = useRef<HTMLButtonElement>(null);
    const OrderTab = useRef<HTMLDivElement>(null);
    const HistoryTab = useRef<HTMLDivElement>(null);
    const TransferRef = useRef<HTMLDialogElement>(null);
    const TargetHandleRef = useRef<HTMLSelectElement>(null);

    const setOrderTab = () => {
        OrderButton.current!.classList.add('app_tab_selected');
        OrderButton.current!.classList.remove('app_tab_normal');
        HistoryButton.current!.classList.add('app_tab_normal');
        HistoryButton.current!.classList.remove('app_tab_selected');
        HistoryTab.current!.style.visibility = "hidden";
        OrderTab.current!.style.visibility = "visible";
    }
    const setHistoryTab = () => {
        OrderButton.current!.classList.add('app_tab_normal');
        OrderButton.current!.classList.remove('app_tab_selected');
        HistoryButton.current!.classList.add('app_tab_selected');
        HistoryButton.current!.classList.remove('app_tab_normal');
        OrderTab.current!.style.visibility = "hidden";
        HistoryTab.current!.style.visibility = "visible";
    }

    const [refreshCount, setRefreshCount] = useState(0);//用于定时刷新
    const [username, setUsername] = useState('');//当前用户的用户名
    const [content, setContent] = useState('');//编辑处理结果的文本框内容
    const [isOpen, setIsOpen] = useState(false);//转派工单的对话框
    const [handlers, setHandlers] = useState<Handlers[]>([]);//转派用户列表
    const [todo, setTodo] = useState<OrderBriefInfo[]>([]);//待办列表
    const [currentOrder, setCurrentOrder] = useState('');//显示详细信息的工单
    
    const maxLength = 500;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= maxLength) {
          setContent(input);
        }
    };

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
        const threeHoursMs = 72 * 60 * 60 * 1000;
      
        return Math.abs(diffMs) > threeHoursMs;
    }

    const todoRequest = async () => {
        const userID = getSessionStorage('userid')
        const response = await fetch( '/api/handlertodo', {
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

    const handlersRequest = async () => {
        const userID = getSessionStorage('userid');
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

        if (!Array.isArray(data)) {
            throw new Error('API response is not an array');
        }
    
        const filteredData = data.filter(item => 
            item.userid !== undefined && 
            String(item.userid) !== userID
        );

        setHandlers(filteredData);
    }

    const transferRequest = async () => {
        TransferRef.current!.close();
        setIsOpen(false);

        const orderid = currentOrder;
        const sourcehandlerid = getSessionStorage('userid');
        const targethandlerid = TargetHandleRef.current?.value;
        const response = await fetch( '/api/transfer', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderid , sourcehandlerid, targethandlerid }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.text()).toString();
        
        setCurrentOrder('');
        setRefreshCount(prev => prev + 1);
        window.alert(data);
    }

    const commitRequest = async () => {
        const orderid = currentOrder;
        const userid = getSessionStorage('userid');
        const result = content;
        const response = await fetch( '/api/commit', {
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
        else if (sessionStorage.getItem('usertype')!.toString()!=="3"){
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
                    <button ref={OrderButton} onClick={setOrderTab} className="app_tab_selected h-15 w-30">我的待办（{todo.length}）</button>
                    <button ref={HistoryButton} onClick={setHistoryTab} className="app_tab_normal h-15 w-30">历史记录</button>
                </div>
                <div className="w-full h-full relative flex flex-col items-center">
                    <div ref={OrderTab} className="w-full h-full absolute inset-0 bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 p-2" style={{ visibility: 'visible' }}>  
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
                                    <span className="text-red-700" >您当前暂时没有待处理的工单</span>
                                </div>
                            )}  
                        </div>
                    </div>
                    <div ref={HistoryTab} className="w-full h-full absolute inset-0 rounded-lg bg-white shadow-2xl shadow-gray-500 shadow-opacity-10 p-2 flex flex-col items-center" style={{ visibility: 'hidden' }}>
                        <StatisticPart className="h-[60px] w-full flex flex-col gap-2" userType={3} refreshCount={refreshCount}/>
                        <LogPart className="h-full w-full flex flex-col" refreshCount={refreshCount}/>
                    </div>
                </div>
                <div className="w-full h-full relative bg-white flex flex-col items-center justify-center gap-2 rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 z-1">
                    <DetailPart className="w-[90%] relative bg-white p-2 border-1 border-sky-700 rounded-lg min-h-[300px] h-[65%] flex items-center justify-center" orderId={currentOrder} userType={3}/>
                    <div className="w-[90%] h-[200px] flex flex-col gap-1 items-center justify-center">
                        <div className="w-full">
                            <span className="text-red-700">*</span><label htmlFor="content" >处理结果:</label><br/>
                            <textarea id="content" className="border-1 p-1 border-sky-700 focus:outline-none focus:border-sky-500 resize-none rounded-sm text-black h-20 w-full overflow-x-hidden overflow-y-auto" value={content} onChange={(e) => handleChange(e)}/>
                            <p className="text-sky-500 left-0" id="loginError">（{content.length}/{maxLength}）</p>
                        </div>
                        <div className="flex flex-row justify-center gap-5">
                            <button className="bg-white text-sky-500 border-1 border-sky-500 px-4 py-2 w-40 rounded-lg hover:border-sky-700 hover:text-sky-700 hover:bg-gray-300 disabled:border-sky-300 disabled:text-sky-300 disabled:bg-gray-300" disabled={(currentOrder === '') ? true : false} onClick={ () => {setIsOpen(true);TransferRef.current!.showModal()}}>转派给其他人员</button>
                            <button className="bg-sky-500 text-white px-4 py-2 w-40 rounded-lg hover:bg-sky-700 disabled:bg-sky-300 disabled:text-gray-300" disabled={(content.length > 0 && currentOrder !== '')?false:true} onClick={ () => commitRequest() }>提交处理结果</button>
                        </div>
                    </div>
                    
                </div>
            </div>
            <dialog ref={TransferRef} open={isOpen} className="absolute inset-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 gap-10 z-10">
                <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                    <button className="right-[10px] top-[10px] absolute text-gray-500 text-2xl hover:scale-150 transition duration-300" onClick={() => {TransferRef.current!.close();setIsOpen(false)}}>✕</button>
                    <h1 className="text-sky-500 text-2xl p-2 m-5 border-b-2 border-sky-500">转派工单</h1>
                    <div className="w-[90%]">
                        <label htmlFor="handler" >转派给:</label><br/>
                        <select id="handler" ref={TargetHandleRef} className="border-1 p-1 border-sky-700 focus:outline-none focus:border-sky-500 resize-none rounded-sm text-black h-8 w-full overflow-x-hidden overflow-y-auto">
                            {handlers.map((handler,index) => (
                                <option value={handler.userid} key={index} >{handler.userid};{handler.userdept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row justify-center gap-5">
                        <button className="bg-white text-sky-500 border-1 border-sky-500 px-4 py-2 w-40 rounded-lg hover:border-sky-700 hover:text-sky-700 hover:bg-gray-300" onClick={ () => {TransferRef.current!.close();setIsOpen(false)}}>返回</button>
                        <button className="bg-sky-500 text-white px-4 py-2 w-40 rounded-lg hover:bg-sky-700" onClick={ () => transferRequest()}>提交</button>
                    </div>
                </div>
            </dialog>
        </div>
    )
}