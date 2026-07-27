import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter } from
'./ui';
import { useAuth } from '../hooks/useAuth';
import { chatbotService } from '../services/chatbot';
import ReactMarkdown from 'react-markdown';
export function HopeChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    {
      role: 'user' | 'bot';
      text: string;
    }[]>(
    []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (user && isOpen && messages.length === 0) {
      const fetchLogs = async () => {
        try {
          const res = await fetch(`/api/chatbot?userId=${user.user_id}`);
          if (!res.ok) throw new Error('Failed to fetch chatbot logs');
          const logs = await res.json();
          if (logs.length > 0) {
            const history = logs.flatMap((l: any) => [
              {
                role: 'user' as const,
                text: l.user_message
              },
              {
                role: 'bot' as const,
                text: l.bot_response
              }
            ]);
            setMessages(history);
          } else {
            setMessages([
              {
                role: 'bot',
                text: "Hi! I'm Hope. How can I assist you today?"
              }
            ]);
          }
        } catch (error) {
          setMessages([
            {
              role: 'bot',
              text: "Hi! I'm Hope. How can I assist you today?"
            }
          ]);
        }
      };
      fetchLogs();
    }
  }, [user, isOpen]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userMsg = input;
    setInput('');
    setMessages((prev) => [
    ...prev,
    {
      role: 'user',
      text: userMsg
    }]
    );
    setIsTyping(true);
    try {
      const response = await chatbotService.sendMessage(
        user.user_id,
        user.app_role || 'citizen',
        userMsg
      );
      setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text: response
      }]
      );
    } catch (error) {
      setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text: "Sorry, I'm having trouble connecting right now."
      }]
      );
    } finally {
      setIsTyping(false);
    }
  };
  if (!user) return null;
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          transition={{
            duration: 0.2
          }}
          className="absolute bottom-16 right-0 w-[350px] shadow-2xl origin-bottom-right">
          
            <Card className="border-emerald-100 shadow-emerald-900/5">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <CardTitle className="text-base">Hope AI Assistant</CardTitle>
                </div>
                <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-600 hover:text-white"
                onClick={() => setIsOpen(false)}>
                
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 h-[350px] overflow-y-auto flex flex-col gap-3 bg-slate-50">
                {messages.map((msg, i) =>
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                    <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-white border text-foreground rounded-bl-sm shadow-sm'}`}>
                  
                      {msg.role === 'bot' ?
                  <ReactMarkdown className="prose prose-sm prose-emerald max-w-none">
                          {msg.text}
                        </ReactMarkdown> :

                  msg.text
                  }
                    </div>
                  </div>
              )}
                {isTyping &&
              <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
              }
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="p-3 bg-white border-t rounded-b-xl">
                <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex w-full gap-2">
                
                  <Input
                  placeholder="Ask Hope..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1" />
                
                  <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}>
                  
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        }
      </AnimatePresence>

      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
        onClick={() => setIsOpen(!isOpen)}>
        
        {isOpen ?
        <X className="w-6 h-6" /> :

        <MessageCircle className="w-6 h-6" />
        }
      </Button>
    </div>);

}