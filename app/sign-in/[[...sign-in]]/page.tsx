import AuthFooter from '@/components/common/AuthFooter'
import Logo from '@/components/common/Logo'
import TypingCarousel from '@/components/common/TypingCarousel'
import VideoBackground from '@/components/common/VideoBackground'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-screen">
      <Logo />
      <div className="w-3/4 relative overflow-hidden bg-[#f2f2f2] backdrop-blur">
        <VideoBackground />
        <div className="absolute inset-0 flex flex-col justify-center pl-8">
          <div className='h-full flex flex-col justify-center'>
            <p className='text-6xl font-bold bg-gradient-to-r from-pink-500 via-[#F78C2A] to-[#fed9b6] bg-clip-text text-transparent'>The AI Chat App from Kevin Wan</p>
            <TypingCarousel />
          </div>
        </div>
      </div>
      <div className="w-1/4 min-w-[425px] flex flex-col items-center justify-between bg-[#F9F9F999]">
        <div className='flex-1' />
        <h2 className="text-3xl font-semibold mb-5 text-center text-[#333]">Get Started</h2>
        <SignIn />
        <AuthFooter />
      </div>
    </div>
  )
}