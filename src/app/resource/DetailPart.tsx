'use client';
import {useState, useEffect} from 'react';

interface Detailprops{
    className?: string;
    orderId: string;
    userType: number;
}

interface Order{
    orderId: string;
    content: string;
    applicatorID: string;
    approverID: string;
    handlerID: string;
    applicatorDept: string;
    approverDept: string;
    handlerDept: string;
    applyTime: string;
    approvalTime: string;
    handleTime: string;
    urgency: number;
    status: number;
    result: string;
    phoneNumber: string;
    attachment: string;
}

export default function DetailPart({className, orderId, userType}:Detailprops){

    const [show, setshow] = useState(false);
    const [orderData, setOrderData] = useState<Order>();

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

    const getOrderstatus = (status: number) => {
        switch(status){
            case 0: return '未提交'
            case 1: return '已提交待审核';
            case 2: return '审核不通过';
            case 3: return '审核通过待处理';
            case 4: return '处理完成';
            default: return '';
        }
    }

    const getStatusColor = (status: number) => {
        switch(status){
            case 0: return 'gray';
            case 2: return 'red';
            default: return '#22c55e';
        }
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
        setOrderData(data);
        setshow(true);
    }

    useEffect (() =>{
        if(orderId !== ''){
            getOrderRequest(orderId);
            setshow(true);
        }
        else
            setshow(false);
    },[orderId]);


    return(
        <div className={className}>
            <div className="w-full h-full absolute inset-0 p-1 z-1 overflow-y-scroll" style={{visibility: show ? 'visible' : 'hidden'}}>
                <label>工单编号:</label><span className="font-bold text-xl text-sky-500">{orderData && orderData.orderId}</span><br/>
                <label>紧急程度:</label><span className="font-bold text-xl" style={{color: getUrgencyColor((orderData && orderData.urgency)||0) }}>{orderData && getOrdertype(orderData.urgency)}</span><br/>
                <div className="flex flex-row min-h-[20px]">
                    <label>内容描述:</label>
                    <p className="text-black min-w-[75%] min-h-[20px] break-words">{orderData && orderData.content}</p><br/>
                </div>
                <label>申请部门:</label><span className="text-black">{orderData && orderData.applicatorDept}</span><br/>
                <label>提交时间:</label><span className="text-black">{orderData && orderData.applyTime}</span><br/>
                {
                    (userType === 2) ? (<></>) : (
                        <>
                            <label>审批部门:</label><span className="text-black">{orderData && orderData.approverDept}</span><br/>
                            <label>审批时间:</label><span className="text-black">{orderData && orderData.approvalTime}</span><br/>
                        </>
                    )
                }
                {
                    (userType === 1) ? (
                        <>
                            <label>操作部门:</label><span className="text-black">{orderData && orderData.handlerDept}</span><br/>
                            <label>操作时间:</label><span className="text-black">{orderData && orderData.handleTime}</span><br/>
                        </>
                    ) : (<></>)
                }
                <label>工单状态:</label><span className="font-bold text-xl" style={{color: getStatusColor((orderData && orderData.status)||0)}}>{orderData && getOrderstatus(orderData.status)}</span><br/>
                <label>联系方式:</label><span className="text-black">{orderData && orderData.phoneNumber}</span><br/>
                {/*<label>附件:</label><span className="text-black">{orderData && orderData.attachment}</span><br/>*/}
                {
                    (userType === 1) ? (
                        <div className="flex flex-row min-h-[20px]">
                            <label>处理结果:</label>
                            <p className="text-black w-[75%] min-h-[20px] break-words">{orderData && orderData.result}</p><br/>
                        </div>
                    ) : (<></>)
                }
            </div>
            <div className="w-full h-full absolute inset-0 flex items-center justify-center" style={{visibility: show ? 'hidden' : 'visible' }}>
                <span className="text-red-700">您还未选择需要操作的工单</span>
            </div>           
        </div>
    );
}