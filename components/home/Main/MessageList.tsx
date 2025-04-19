import { useAppContext } from "@/components/AppContext"
import AIChatMessage from "@/components/common/AIChatMessage";
import { ActionType } from "@/reducers/AppReducer";
import { useEffect, useRef } from "react";

export default function MessageList() {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { state: { messageList, streamingId, selectedChat }, dispatch } = useAppContext();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messageList]);

    async function getData(chatId: string) {
        const response = await fetch(`/api/message/list?chatId=${chatId}`, {
            method: "GET"
        })
        if (!response.ok) {
            console.log('消息列表请求失败', response.statusText)
            return
        }
        const { data } = await response.json()
        dispatch({ type: ActionType.UPDATE, fiel: 'messageList', value: data.list })
    }

    useEffect(() => {
        if (selectedChat) {
            getData(selectedChat.id)
        } else {
            dispatch({ type: ActionType.UPDATE, fiel: 'messageList', value: [] })
        }
    }, [selectedChat])

    return (
        <div className="w-full pt-10 pb-48 bg-white dark:bg-[#212121]">
            <ul>
                {messageList.map((message) => {
                    const isUser = message.role === 'user'
                    return (
                        <li key={message.id}>
                            <div className={`w-full max-w-2xl mx-auto flex items-center ${isUser ? 'justify-end':'justify-start'}  space-x-6 py-6 text-base`}>
                                <div className={`w-fit ${isUser ? "bg-[#f4f4f4] p-2 rounded-2xl dark:bg-[#303030] dark:text-white": "bg-white dark:bg-[#212121] dark:text-white"} `}>
                                    <AIChatMessage message={message.content} />
                                </div>
                            </div>
                        </li>
                    )
                })}
                <div ref={messagesEndRef} />
            </ul>
        </div>
    )
}