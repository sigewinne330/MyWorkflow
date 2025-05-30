'use client';
import UserPart from "../resource/UserPart";
import { useState,useRef,useEffect } from "react";
import { useRouter } from 'next/navigation';
import DetailPart from "../resource/DetailPart";
import Progress from "../resource/Progress";
import { getSessionStorage } from "../resource/sessionStorage";

interface OrderBriefInfo {
    orderid: string;
    urgency: number;
    applytime: string;
}

export default function Applicator() {
    const Router = useRouter();

    const OrderDialogRef = useRef<HTMLDialogElement>(null);
    const DeleteDialogRef = useRef<HTMLDialogElement>(null);
    const OrderButton = useRef<HTMLButtonElement>(null);
    const SaveButton = useRef<HTMLButtonElement>(null);
    const OrderTab = useRef<HTMLDivElement>(null);
    const SaveTab = useRef<HTMLDivElement>(null);

    const setOrderTab = () => {
        OrderButton.current!.classList.add('app_tab_selected');
        OrderButton.current!.classList.remove('app_tab_normal');
        SaveButton.current!.classList.add('app_tab_normal');
        SaveButton.current!.classList.remove('app_tab_selected');
        SaveTab.current!.style.visibility = "hidden";
        OrderTab.current!.style.visibility = "visible";
    }
    const setSaveTab = () => {
        OrderButton.current!.classList.add('app_tab_normal');
        OrderButton.current!.classList.remove('app_tab_selected');
        SaveButton.current!.classList.add('app_tab_selected');
        SaveButton.current!.classList.remove('app_tab_normal');
        OrderTab.current!.style.visibility = "hidden";
        SaveTab.current!.style.visibility = "visible";
    }

    const [refreshCount, setRefreshCount] = useState(0);//用于定时刷新
    const [username, setUsername] = useState('');//显示当前用户的用户名
    const [applied, setApplied] = useState<OrderBriefInfo[]>([]);//显示已提交工单列表
    const [saved, setSaved] = useState<OrderBriefInfo[]>([]);//显示暂存工单列表
    const [currentOrder, setCurrentOrder] = useState('');//显示详细信息的工单
    const [currentStatus, setCurrentStatus] = useState(0);//显示详细信息的工单的状态
    const [load, setLoad] = useState(false);//是否加载暂存工单

    //编辑工单内容
    const [urgency, setUrgency] = useState(3);
    const [content, setContent] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [attachment, setAttachment] = useState<File>();
    const [prompt, setPrompt] = useState('');

    const maxLength = 500;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= maxLength) {
          setContent(input);
        }
    };

    const clear = () => {
        setUrgency(3);
        setContent('');
        setPhoneNumber('');
        setPrompt('');
        setLoad(false);
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

    const appliedRequest = async () => {
        const userID = getSessionStorage('userid')
        const response = await fetch( '/api/selfapply', {
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
        setApplied(data);
    }

    const savedRequest = async () => {
        const userID = getSessionStorage('userid')
        const response = await fetch( '/api/selfdraft', {
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
        setSaved(data);
    }

    const getDetails = (orderID: string) => {
        setCurrentOrder(orderID);
    }

    const deleteRequest = async () => {
        DeleteDialogRef.current!.close()

        const orderid = currentOrder;
        const response = await fetch( '/api/delete', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: orderid,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.text()).toString();

        setCurrentOrder('');
        setRefreshCount(prev => prev + 1);
        window.alert(data);
    }

    const getOrderRequest = async (orderID: string) => {
        const response = await fetch( '/api/orderdetails', {
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

        const data = await response.json();
        setUrgency(parseInt(data.urgency));
        setContent(data.content);
        setPhoneNumber(data.phoneNumber);
        setAttachment(data.attachment ? data.attachment : '');
    }

    const handleEdit = () => {
        setLoad(true);
        getOrderRequest(currentOrder);
    }

    const createRequest = async (commit:boolean) => {
        const applicatorID = getSessionStorage('userid');
        const status = (commit === true) ? 1 : 0;
        
        const response = await fetch( '/api/neworder', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ applicatorID, urgency, content, phoneNumber, status }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        setCurrentOrder('');
        setRefreshCount(prev => prev + 1);
        window.alert(data);
    }

    const modifyRequest = async (commit:boolean) => {
        const orderId = currentOrder;
        const status = (commit === true) ? 1 : 0;
        const response = await fetch( '/api/modifyorder', {
            mode:'cors',
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, urgency, content, phoneNumber, attachment, status }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        setCurrentOrder('');
        setRefreshCount(prev => prev + 1);
        window.alert(data);
    }

    const check = () => {
        if(content === ''){
            setPrompt('请填写完整的工单申请内容！');
            return false;
        }
        else if(phoneNumber.length !== 11){
            setPrompt('请填写完整的手机号码！');
            return false;
        }
        /*else if(attachment && (attachment!.size > 10 * 1024 * 1024)){
            setPrompt('文件大小不能超过10M！');
            return false;
        }*/
        else{
            setPrompt('');
            return true;
        }
    }

    const handleSave = async () => {
        if(check() === false)
            return;
        if(load === true)
            modifyRequest(false);
        else
            createRequest(false);
        OrderDialogRef.current!.close();
    }

    const handleCommit = async () => {
        if(check() === false)
            return;
        if(load === true)
            modifyRequest(true);
        else
            createRequest(true);
        OrderDialogRef.current!.close();
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
        else {
            setUsername(hasSession);
        }
        appliedRequest();
        savedRequest();
    }, [refreshCount, Router]);

    return(
        <div className="w-screen h-screen bg-sky-100 overflow-y-scroll">
            <div className="w-full h-[70px] flex items-center justify-between bg-sky-300 z-2 sticky top-0 shadow-sm shadow-gray-500 shadow-opacity-1">       
                <UserPart className="left-5 absolute inset-0 w-[250px] h-[60px] px-1 py-2 hover:scale-105 transition duration-300 flex flex-row gap-2 justify-center" userName={username}/>
                <button className="right-5 absolute w-30 h-10 text-white bg-sky-500 rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 hover:bg-sky-700 px-5 py-2 transition duration-300" onClick={() => {clear(); OrderDialogRef.current!.showModal()}}>创建工单</button>
            </div>
            <div className="w-full h-[200vh] min-h-[540px] flex flex-col gap-3 px-5 py-2">
                <div className="w-full h-[20vh] bg-white flex flex-row gap-10 items-center justify-center rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10">
                    <button ref={OrderButton} onClick={setOrderTab} className="app_tab_selected h-15 w-30">我提交的工单</button>
                    <button ref={SaveButton} onClick={setSaveTab} className="app_tab_normal h-15 w-30">我保存的工单</button>
                </div>
                <div className="w-full h-full relative flex flex-col items-center">
                    <div ref={OrderTab} className="h-full w-full absolute inset-0 bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 p-2" style={{ visibility: 'visible' }}>
                        <div className="h-full w-full flex items-center justify-center">
                            { (applied.length > 0) ? ( 
                                <div className="h-full w-full rounded-lg flex flex-col p-1 overflow-y-scroll">
                                    {applied.map((briefOrder,index) => (
                                        <button className="h-[40px] w-full flex flex-row items-center justify-center gap-10 p-1 my-1 shadow-lg bg-white shadow-gray-300 shadow-opacity-10 brightness-100 hover:brightness-90"  key={index} onClick={() => { getDetails(briefOrder.orderid);setCurrentStatus(1);}}>
                                            <span className="text-sky-500 text-sm sm:text-md md:text-lg lg:text-xl w-[30%]">{briefOrder.orderid}</span>
                                            <span className="text-sm sm:text-md md:text-lg lg:text-xl font-bold w-[30%]" style={{color: getUrgencyColor(briefOrder.urgency) }}>{getOrdertype(briefOrder.urgency)}</span>
                                            <span className="text-black text-sm sm:text-md md:text-lg lg:text-xl leading-4 w-[40%]">{briefOrder.applytime}</span>
                                        </button>
                                    ))}
                                </div>) : (
                                <div className="flex items-center justify-center">
                                    <span className="text-red-700" >您当前暂时没有已提交的工单</span>
                                </div>
                            )}  
                        </div>
                    </div>
                    <div ref={SaveTab} className="h-full w-full absolute inset-0 bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 p-2" style={{ visibility: 'hidden' }}>
                        <div className="h-full w-full flex items-center justify-center">
                            { (saved.length > 0) ? ( 
                                <div className="h-full w-full rounded-lg flex flex-col p-1 overflow-y-scroll">
                                    {saved.map((briefOrder,index) => (
                                        <button className="h-[40px] w-full flex flex-row items-center justify-center gap-10 p-1 my-1 shadow-lg bg-white shadow-gray-300 shadow-opacity-10 brightness-100 hover:brightness-90"  key={index} onClick={() => { getDetails(briefOrder.orderid);setCurrentStatus(0);}}>
                                            <span className="text-sky-500 text-sm sm:text-md md:text-lg lg:text-xl w-[30%]">{briefOrder.orderid}</span>
                                            <span className="text-sm sm:text-md md:text-lg lg:text-xl font-bold w-[30%]" style={{color: getUrgencyColor(briefOrder.urgency) }}>{getOrdertype(briefOrder.urgency)}</span>
                                            <span className="text-black text-sm sm:text-md md:text-lg lg:text-xl leading-4 w-[40%]">{briefOrder.applytime}</span>
                                        </button>
                                    ))}
                                </div>) : (
                                <div className="flex items-center justify-center">
                                    <span className="text-red-700" >您当前暂时没有暂存的工单</span>
                                </div>
                            )}  
                        </div>   
                    </div>
                </div>
                <div className="w-full h-full bg-white flex flex-col gap-2 items-center justify-center rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10 z-1">
                    <Progress className="w-[90%] h-[80px]" orderID={currentOrder}/>
                    <DetailPart className="w-[90%] relative bg-white p-2 border-1 border-sky-700 rounded-lg min-h-[320px] h-[70%] flex items-center justify-center" orderId={currentOrder} userType={1}/>
                    <div className="w-[90%] h-[40px] flex flex-row items-center justify-center gap-5" style={{ visibility: (currentOrder !== '' && currentStatus === 0)? 'visible' : 'hidden'}}>
                        <button className="bg-sky-500 text-white px-4 py-2 w-40 rounded-lg hover:bg-sky-700" onClick={() => {handleEdit(); OrderDialogRef.current!.showModal();}}>编辑</button>
                        <button className="bg-white text-red-500 border-1 border-red-500 px-4 py-2 w-40 rounded-lg hover:border-red-700 hover:text-red-700 hover:bg-gray-300" onClick={() => DeleteDialogRef.current!.showModal()}>删除</button>
                    </div>
                </div>
                
            </div>
            <dialog ref={OrderDialogRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10" >
                <button className="right-[10px] top-[10px] absolute text-gray-500 text-2xl hover:scale-150 transition duration-300" onClick={() => OrderDialogRef.current!.close()}>✕</button>
                <div className="flex flex-col items-center justify-center gap-5 py-10">
                    <h1 className="text-sky-500 text-2xl p-2 border-b-2 border-sky-500">创建工单</h1>
                    <div className="w-[80%] h-[80%]">
                        <div className="flex flex-col justify-center gap-5">
                            <div className="inline-block h-5">
                                <span className="text-red-700">*</span><label htmlFor="urgency" >工单类型:</label>
                                <select id="urgency" className="custom-input text-black" value={urgency} onChange={(e) => setUrgency(parseInt(e.target.value))}>
                                    <option value="1">紧急申请</option>
                                    <option value="2">重要申请</option>
                                    <option value="3">常规申请</option>
                                </select>
                            </div>
                            <div className="inline-block h-35">
                                <span className="text-red-700">*</span><label htmlFor="content" >内容:</label><br/>
                                <textarea id="content" className="border-1 p-1 border-sky-700 focus:outline-none focus:border-sky-500 resize-none rounded-sm text-black h-20 w-full overflow-x-hidden overflow-y-auto" value={content} onChange={(e) => handleChange(e)}/>
                                <p className="text-sky-500 left-0" id="loginError">（{content.length}/{maxLength}）</p>
                            </div>
                            {/*<div className="inline-block h-20">
                                <label htmlFor="attachment" >附件:</label>
                                <input id="attachment" className="custom-input text-black" type="file" onChange={(e) => (e.target.files && e.target.files?.length > 0 )?setAttachment(e.target.files[0]):null}/><br/>
                                <p className="text-sky-500 left-0" id="loginError">多个附件请压缩后打包上传！</p>
                            </div>*/}
                            <div className="inline-block h-5">
                                <span className="text-red-700">*</span><label htmlFor="PhoneNumber" >联系方式:</label>
                                <input id="PhoneNumber" className="custom-input text-black" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}/>
                            </div>
                            <p className="text-red-700 left-0" id="loginError">{prompt}</p>
                            <div className="flex flex-row justify-center gap-5">
                                <button className="bg-white text-sky-500 border-1 border-sky-500 px-5 py-3 w-40 rounded-lg hover:border-sky-700 hover:text-sky-700 hover:bg-gray-300" onClick={() => handleSave()}>保存</button>
                                <button className="bg-sky-500 text-white px-5 py-3 w-40 rounded-lg hover:bg-sky-700" onClick={() => handleCommit()}>提交</button>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
            <dialog ref={DeleteDialogRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[240px] bg-white rounded-lg shadow-2xl shadow-gray-500 shadow-opacity-10" >
                <button className="right-[10px] top-[10px] absolute text-gray-500 text-2xl hover:scale-150 transition duration-300" onClick={() => DeleteDialogRef.current!.close()}>✕</button>
                <div className="flex flex-col items-center justify-center gap-5 py-10">
                    <h1 className="text-sky-500 text-2xl p-2 border-b-2 border-sky-500">提示</h1>
                    <p className="text-black">确定要删除此份暂存工单吗？删除后将不可恢复！</p>
                    <div className="flex flex-row items-center justify-center gap-5">
                        <button className="bg-white text-sky-500 border-1 border-sky-500 px-4 py-2 w-40 rounded-lg hover:border-sky-700 hover:text-sky-700 hover:bg-gray-300" onClick={() => DeleteDialogRef.current!.close()}>取消</button>
                        <button className="bg-red-500 text-white px-4 py-2 w-40 rounded-lg hover:bg-red-700" onClick={ () => deleteRequest()}>删除</button>
                    </div>
                </div>
            </dialog>
        </div>
    )
}