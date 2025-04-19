"use client"
import { useAppContext } from "@/components/AppContext";
import ChatInput from "./ChatInput";
import Menu from "./Menu";
import MessageList from "./MessageList";
import Welcome from "./Welcome";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'

export default function Main() {
    const { state: {selectedChat}} = useAppContext()
    return (
        <div className="flex-1 relative">
             <header className=" absolute top-1 right-1 flex justify-end items-center p-4 gap-4 h-16">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
            <main
                className="overflow-y-auto w-full h-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
                <Menu />
                { !selectedChat && <Welcome />}
                <MessageList/>
                <ChatInput />
            </main>
        </div>
    )
}
