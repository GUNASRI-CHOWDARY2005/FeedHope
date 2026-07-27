import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
export function Splash() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user) {
        if (!user.app_role) navigate('/onboarding/role');else
        navigate('/');
      } else {
        navigate('/auth');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [user, isLoading, navigate]);
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white p-4">
      <motion.div
        initial={{
          scale: 0.8,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        transition={{
          duration: 0.8,
          ease: 'easeOut'
        }}
        className="flex flex-col items-center">
        
        <motion.div
          animate={{
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
          
          <HeartHandshake className="w-24 h-24 mb-6 text-accent" />
        </motion.div>

        <h1 className="text-5xl font-bold mb-4 tracking-tight">FeedHope</h1>
        <p className="text-xl text-primary-100 font-medium tracking-wide">
          Every Life Matters
        </p>
      </motion.div>
    </div>);

}