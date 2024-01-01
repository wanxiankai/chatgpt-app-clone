"use client"
import Button from "@/components/common/Button";
import { MdRefresh } from 'react-icons/md'
import { PiLightningFill, PiStopBold } from 'react-icons/pi'
import { FiSend } from 'react-icons/fi'
import TextareaAutoSize from 'react-textarea-autosize'
import { useEffect, useRef, useState } from "react";
import { Message, MessageRequestBody } from "@/types/chat";
import { useAppContext } from "@/components/AppContext";
import { ActionType } from "@/reducers/AppReducer";
import { useEventBusContext } from "@/components/EventBusContext";

export default function ChatInput() {
    const [messageText, setMessageText] = useState('')
    const { state: { messageList, currentModel, streamingId, selectedChat }, dispatch } = useAppContext()
    const stopRef = useRef(false)
    const chatIdRef = useRef('')
    const { publish } = useEventBusContext()

    useEffect(() => {
        if(chatIdRef.current === selectedChat?.id){
            return
        }
        chatIdRef.current = selectedChat?.id ?? ""
        stopRef.current = true
    },[selectedChat])

    async function createOrUpdateMessage(message: Message) {
        const response = await fetch("/api/message/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message)
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        const { data } = await response.json()
        if (!chatIdRef.current) {
            chatIdRef.current = data.message.chatId
            publish('fetchChatList')
            dispatch({type: ActionType.UPDATE, fiel:'selectedChat', value: {id: chatIdRef.current}})
        }
        return data.message
    }

    async function deleteMessage(id: string) {
        const response = await fetch(`/api/message/delete?id=${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        const { code } = await response.json()
        return code === 0
    }

    async function sendMessage() {
        const currentMessage = await createOrUpdateMessage({
            id: '',
            role: 'user',
            content: messageText,
            chatId: chatIdRef.current
        })
        const messages = messageList.concat([currentMessage]);
        // 先将当前Message 添加到列表，更新试图，然后再调用接口显示回复， 然后清空输入框
        dispatch({ type: ActionType.ADD_MESSAGE, message: currentMessage })
        toSend(messages)
    }

    async function reSendMessage() {
        const messages = [...messageList];
        if (messages.length !== 0 && messages[messages.length - 1].role === 'assistant') {
            const result = await deleteMessage(messages[messages.length - 1].id)
            if (!result) {
                console.log('删除消息失败！')
                return;
            }
            dispatch({ type: ActionType.REMOVE_MESSAGE, message: messages[messages.length - 1] })
        }
        messages.splice(messages.length - 1, 1)
        toSend(messages)
    }

    async function toSend(messages: Message[]) {
        stopRef.current = false;
        const requestBody: MessageRequestBody = { messages, model: currentModel }
        setMessageText('')

        const controller = new AbortController();
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: JSON.stringify(requestBody)
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        if (!response.body) {
            console.log("body error")
            return
        }
        const responseMessage: Message = await createOrUpdateMessage({
            id: '',
            role: 'assistant',
            content: '',
            chatId: chatIdRef.current
        })

        dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage })
        dispatch({ type: ActionType.UPDATE, fiel: 'streamingId', value: responseMessage.id })

        const reader = response.body.getReader();
        const decoder = new TextDecoder()
        let done = false;
        let content = ''
        while (!done) {
            if (stopRef.current) {
                controller.abort();
                break;
            }
            const result = await reader.read()
            done = result.done
            const chunk = decoder.decode(result.value)
            content += chunk
            dispatch({ type: ActionType.UPDATE_MESSAGE, message: { ...responseMessage, content } })
        }
        createOrUpdateMessage({ ...responseMessage, content })
        dispatch({ type: ActionType.UPDATE, fiel: 'streamingId', value: '' })
        // setMessageText('')
    }

    return (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4">
                {messageList.length !== 0 && (
                    streamingId !== '' ?
                        (<Button
                            icon={PiStopBold}
                            className="font-medium"
                            onClick={() => {
                                stopRef.current = true
                            }}
                            variant="primary"
                        >
                            停止生成
                        </Button>)
                        :
                        (<Button
                            icon={MdRefresh}
                            className="font-medium"
                            onClick={reSendMessage}
                            variant="primary"
                        >
                            重新生成
                        </Button>)
                )}
                <div className="flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4">
                    <div className="mx-3 mb-2.5">
                        <PiLightningFill />
                    </div>
                    <TextareaAutoSize
                        className="outline-none flex-1 max-h-64 mb-1.5 bg-transparent text-black dark:text-white resize-none border-0"
                        placeholder="输入一条消息..."
                        rows={1}
                        value={messageText}
                        onChange={(e) => {
                            setMessageText(e.target.value)
                        }}
                    />
                    <Button
                        className="mx-3 !rounded-lg"
                        icon={FiSend}
                        disabled={messageText.trim() === '' || streamingId !== ''}
                        variant="primary"
                        onClick={sendMessage}
                    />
                </div>
                <footer className="text-center text-sm text-gray-700 dark:text-gray-300 px-4 pb-6">
                    ©️{new Date().getFullYear()}&nbsp; <a
                        className="font-medium py-[1px] border-b border-dotted border-black/60 hover:border-black/0 dark:border-gray-200 dark:hover:border-gray-200/0"
                        href="https://github.com/wanxiankai" target="_blank"
                    >
                        wanxiankai
                    </a>
                    .&nbsp;基于第三方提供的接口
                </footer>
            </div>
        </div>
    )
}