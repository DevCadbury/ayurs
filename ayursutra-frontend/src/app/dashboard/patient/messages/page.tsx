"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  Filter,
  Settings,
  Clock,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  Reply,
  Forward,
  Star,
  StarOff,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  listMessageThreads,
  listChatMessages,
  sendChatMessage,
} from "@/lib/api";

export default function PatientMessagesPage() {
  const { user, token } = useAuth();
  const [threads, setThreads] = useState<
    Array<{ chatId: string; doctor: Record<string, unknown> }>
  >([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<Record<string, unknown> | null>(null);
  const [starredMessages, setStarredMessages] = useState<Set<number>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [currentMediaUrls, setCurrentMediaUrls] = useState<string[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const activeThread = useMemo(
    () => threads.find((t) => t.chatId === activeChatId) || null,
    [threads, activeChatId]
  );

  function scrollToBottom() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
    setIsNearBottom(true);
    setShowScrollToBottom(false);
  }

  function handleScroll() {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show scroll to bottom button if user has scrolled up more than 100px
    setShowScrollToBottom(distanceFromBottom > 100);
    setIsNearBottom(distanceFromBottom < 50);
  }

  function checkIfNearBottom() {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    return distanceFromBottom < 50;
  }

  function formatTime(timestamp: string | number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  function getMessageStatus(message: Record<string, unknown>) {
    // Mock status - in real app, this would come from the API
    const isMe = (message.sender as any)?.uid === user?.uid || message.sender === user?.uid;
    if (!isMe) return null;
    
    const timestamp = message.timestamp || message.createdAt;
    const now = new Date();
    const messageTime = new Date(timestamp as string);
    const diffInMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'sending';
    if (diffInMinutes < 5) return 'sent';
    return 'delivered';
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function toggleStarMessage(messageIndex: number) {
    const newStarred = new Set(starredMessages);
    if (newStarred.has(messageIndex)) {
      newStarred.delete(messageIndex);
    } else {
      newStarred.add(messageIndex);
    }
    setStarredMessages(newStarred);
  }

  function handleReply(message: Record<string, unknown>) {
    setReplyTo(message);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }

  function getFileTypeIcon(url: string) {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  }

  function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  function handleFileSelect(files: FileList | null) {
    if (!files) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        newFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  function uploadFileToServer(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Mock upload - in real app, upload to your server
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate upload delay with progress
        const uploadTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds
        setTimeout(() => {
          // Return a mock URL - in real app, this would be the server response
          const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
          resolve(mockUrl);
        }, uploadTime);
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }

  function getFilePreview(file: File): string {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function openMediaViewer(urls: string[], startIndex: number = 0) {
    setCurrentMediaUrls(urls);
    setSelectedMediaIndex(startIndex);
    setMediaViewerOpen(true);
  }

  function closeMediaViewer() {
    setMediaViewerOpen(false);
    setCurrentMediaUrls([]);
    setSelectedMediaIndex(0);
  }

  async function loadThreads() {
    if (!user?.uid || !token) return;
    setLoadingThreads(true);
    setError(null);
    try {
      const list = await listMessageThreads(user.uid, token);
      setThreads(list);
      if (!activeChatId && list.length > 0) setActiveChatId(list[0].chatId);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load threads");
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadMessages(chatId: string) {
    if (!token || !user?.uid) return;
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await listChatMessages(chatId, token, user.uid);
      setMessages(res.messages || []);
      // Only auto-scroll if user is near bottom or it's a new conversation
      setTimeout(() => {
        if (isNearBottom || messages.length === 0) {
          scrollToBottom();
        }
      }, 100);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend() {
    if (!activeChatId || !user?.uid || !token) return;
    if (!text.trim() && !attachmentUrl.trim() && selectedFiles.length === 0) return;
    
    setIsTyping(true);
    setUploadingFiles(true);
    
    try {
      let uploadedUrls: string[] = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        try {
          const uploadPromises = selectedFiles.map(file => uploadFileToServer(file));
          uploadedUrls = await Promise.all(uploadPromises);
        } catch (uploadError) {
          setError(`Failed to upload files: ${(uploadError as Error).message}`);
          return;
        }
      }
      
      // Ensure we always have some content for the backend
      let messageText = text.trim();
      if (!messageText && selectedFiles.length > 0) {
        // If only files are being sent, create a descriptive message
        const fileNames = selectedFiles.map(file => file.name).join(', ');
        messageText = `📎 Shared ${selectedFiles.length} file(s): ${fileNames}`;
      } else if (!messageText && attachmentUrl.trim()) {
        // If only URL attachment, create a descriptive message
        messageText = `🔗 Shared attachment: ${attachmentUrl.trim()}`;
      }
      
      const messageData: any = {
          senderId: user.uid,
        text: messageText || "Message", // Always provide text content
          attachmentUrl: attachmentUrl.trim() || undefined,
        mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      };
      
      if (replyTo) {
        messageData.replyTo = replyTo._id || replyTo.id;
      }
      
      const res = await sendChatMessage(activeChatId, messageData, token);
      setMessages(res.messages || []);
      setText("");
      setAttachmentUrl("");
      setSelectedFiles([]);
      setReplyTo(null);
      // Only auto-scroll if user is near bottom
      setTimeout(() => {
        if (isNearBottom) {
          scrollToBottom();
        }
      }, 100);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to send message");
    } finally {
      setIsTyping(false);
      setUploadingFiles(false);
    }
  }

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, token]);

  useEffect(() => {
    if (activeChatId) loadMessages(activeChatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <DashboardLayout>
        <div className="h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 h-full">
            {/* Sidebar - Therapists List */}
            <motion.div 
              className="md:col-span-1 bg-white border-r border-gray-200 flex flex-col"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  />
                </div>
              </div>

              {/* Therapists List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {loadingThreads && (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                  </div>
                )}
                {!loadingThreads && threads.length === 0 && (
                  <div className="p-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No conversations yet</p>
                  </div>
                )}
                <div className="divide-y divide-gray-100">
                  {threads.map((t, index) => (
                    <motion.button
                      key={t.chatId}
                      onClick={() => setActiveChatId(t.chatId)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-all duration-200 ${
                        activeChatId === t.chatId ? "bg-indigo-50 border-r-4 border-indigo-500" : ""
                      }`}
                      whileHover={{ x: 4 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg">
                            <AvatarImage src={t.doctor?.avatar as string || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                              {(t.doctor?.name as string || "D").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {String(t.doctor?.name || "Therapist")}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {String(t.doctor?.specialty || "Ayurvedic Specialist")}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Online now
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-400">
                            {formatTime(Date.now())}
                          </div>
                          <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-700">
                            2
                          </Badge>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Chat Area */}
            <motion.div 
              className="md:col-span-3 flex flex-col bg-white h-full"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {activeThread ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activeThread.doctor?.avatar as string || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            {(activeThread.doctor?.name as string || "D").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {String(activeThread.doctor?.name || "Therapist")}
                          </h3>
                    <p className="text-sm text-gray-500">
                            {String(activeThread.doctor?.specialty || "Ayurvedic Specialist")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/50 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    onScroll={handleScroll}
                  >
                    <div className="space-y-2">
                      {loadingMessages && (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                        </div>
                      )}
                      
                      <AnimatePresence>
                  {messages.map((m, idx) => {
                          const isMe = (m.sender as any)?.uid === user?.uid || m.sender === user?.uid;
                          const messageStatus = getMessageStatus(m);
                          const isStarred = starredMessages.has(idx);
                          
                    return (
                            <motion.div
                        key={idx}
                              className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -20, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className={`flex items-start gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : ""}`}>
                                {!isMe && (
                                  <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                                    <AvatarImage src={activeThread.doctor?.avatar as string || ""} />
                                    <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                      {(activeThread.doctor?.name as string || "D").slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`relative ${isMe ? "text-right" : "text-left"}`}>
                                  {/* Reply Context */}
                                  {(m.replyTo as any) && (
                                    <div className={`mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-indigo-400 ${
                                      isMe ? "text-right" : "text-left"
                                    }`}>
                                      <p className="text-xs text-gray-600 font-medium">Replying to:</p>
                                      <p className="text-sm text-gray-800 truncate">
                                        {(m.replyTo as any)?.text || "Previous message"}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Message Bubble */}
                                  <motion.div
                                    className={`relative px-3 py-2 rounded-2xl ${
                                      isMe 
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" 
                                        : "bg-gray-100 text-gray-900"
                                    }`}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    {/* Text Message */}
                                    {(m.text as any) && (
                                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {String(m.text)}
                                      </p>
                                    )}
                                    
                                    {/* Media Attachments */}
                                    {(m.mediaUrls as any) && Array.isArray(m.mediaUrls) && m.mediaUrls.length > 0 && (
                                      <div className="mt-3 space-y-3">
                                        {/* Image Gallery */}
                                        {m.mediaUrls.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length > 0 && (
                                          <div className="space-y-2">
                                            {m.mediaUrls.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).map((url: string, mediaIndex: number) => (
                                              <motion.div 
                                                key={mediaIndex} 
                                                className="relative group"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                              >
                                                <div className="relative overflow-hidden rounded-xl shadow-lg">
                                                  <img 
                                                    src={url} 
                                                    alt={`Media ${mediaIndex + 1}`}
                                                    className={`w-full max-w-sm rounded-xl object-cover cursor-pointer hover:scale-105 transition-transform duration-200 ${
                                                      isMe ? 'border-2 border-white/20' : 'border-2 border-gray-200'
                                                    }`}
                                                    style={{ 
                                                      maxHeight: '300px',
                                                      minHeight: '150px',
                                                      objectFit: 'cover'
                                                    }}
                                                    onClick={() => {
                                                      const imageUrls = (m.mediaUrls as string[])?.filter((u: string) => u.match(/\.(jpg|jpeg|png|gif|webp)$/i)) || [];
                                                      openMediaViewer(imageUrls, imageUrls.indexOf(url));
                                                    }}
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.style.display = 'none';
                                                      const parent = target.parentElement;
                                                      if (parent) {
                                                        parent.innerHTML = `
                                                          <div class="flex items-center justify-center h-32 ${isMe ? 'bg-white/20' : 'bg-gray-100'} rounded-xl">
                                                            <div class="text-center">
                                                              <ImageIcon class="h-8 w-8 ${isMe ? 'text-white/60' : 'text-gray-400'} mx-auto mb-2" />
                                                              <p class="text-sm ${isMe ? 'text-white/80' : 'text-gray-500'}">Image not available</p>
                                                            </div>
                                                          </div>
                                                        `;
                                                      }
                                                    }}
                                                  />
                                                  {/* Overlay with actions */}
                                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl">
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                                      <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        className={`h-8 w-8 p-0 shadow-lg ${
                                                          isMe 
                                                            ? 'bg-white/90 hover:bg-white text-gray-700' 
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                        }`}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          window.open(url, '_blank');
                                                        }}
                                                      >
                                                        <ImageIcon className="h-4 w-4" />
                                                      </Button>
                                                      <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        className={`h-8 w-8 p-0 shadow-lg ${
                                                          isMe 
                                                            ? 'bg-white/90 hover:bg-white text-gray-700' 
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                        }`}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const link = document.createElement('a');
                                                          link.href = url;
                                                          link.download = url.split('/').pop() || 'image';
                                                          link.click();
                                                        }}
                                                      >
                                                        <Download className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {/* File Attachments */}
                                        {m.mediaUrls.filter(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length > 0 && (
                                          <div className="space-y-2">
                                            {m.mediaUrls.filter(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).map((url: string, mediaIndex: number) => (
                                              <motion.div 
                                                key={mediaIndex} 
                                                className="relative group"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                              >
                                                <div className={`p-4 rounded-xl border flex items-center gap-4 hover:opacity-90 transition-colors duration-200 ${
                                                  isMe 
                                                    ? 'bg-white/20 border-white/30' 
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                  <div className="flex-shrink-0">
                                                    {getFileTypeIcon(url)}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${
                                                      isMe ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                      {url.split('/').pop() || 'Attachment'}
                                                    </p>
                                                    <p className={`text-xs opacity-75 ${
                                                      isMe ? 'text-white/80' : 'text-gray-500'
                                                    }`}>
                                                      Click to download
                                                    </p>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Button 
                                                      size="sm" 
                                                      variant="ghost" 
                                                      className={`h-8 w-8 p-0 ${
                                                        isMe 
                                                          ? 'text-white hover:bg-white/20' 
                                                          : 'text-gray-600 hover:bg-gray-200'
                                                      }`}
                                                      onClick={() => window.open(url, '_blank')}
                                                    >
                                                      <ImageIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      size="sm" 
                                                      variant="ghost" 
                                                      className={`h-8 w-8 p-0 ${
                                                        isMe 
                                                          ? 'text-white hover:bg-white/20' 
                                                          : 'text-gray-600 hover:bg-gray-200'
                                                      }`}
                                                      onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = url.split('/').pop() || 'file';
                                                        link.click();
                                                      }}
                                                    >
                                                      <Download className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Legacy Attachment URL */}
                                    {m.attachmentUrl && (
                                      <div className="mt-2 p-2 bg-white/20 rounded-lg flex items-center gap-2">
                                        {getFileTypeIcon(m.attachmentUrl as string)}
                                        <a 
                                          href={m.attachmentUrl as string} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm underline hover:no-underline"
                                        >
                                          View Attachment
                                        </a>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                    
                                    {/* Message Actions */}
                                    <div className={`absolute top-0 ${isMe ? "-left-12" : "-right-12"} opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1`}>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-gray-100"
                                        onClick={() => handleReply(m)}
                                      >
                                        <Reply className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-gray-100"
                                        onClick={() => toggleStarMessage(idx)}
                                      >
                                        {isStarred ? (
                                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        ) : (
                                          <StarOff className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-gray-100"
                                        onClick={() => setSelectedMessage(selectedMessage === idx ? null : idx)}
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                  
                                  {/* Message Status and Time */}
                                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(String(m.timestamp || m.createdAt || Date.now()))}
                                    </span>
                                    {isMe && messageStatus && (
                                      <div className="flex items-center ml-1">
                                        {messageStatus === 'sending' && <Clock className="h-3 w-3 text-gray-400" />}
                                        {messageStatus === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
                                        {messageStatus === 'delivered' && <CheckCheck className="h-3 w-3 text-indigo-500" />}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      
                      {isTyping && (
                        <motion.div
                          className="flex justify-start"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-2xl">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">Typing...</span>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={endRef} />
                    </div>
                    
                    {/* Scroll to Bottom Button */}
                    {showScrollToBottom && (
                      <motion.div
                        className="absolute bottom-4 right-4 z-10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Button
                          onClick={scrollToBottom}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
                          size="sm"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-white rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  {/* Reply Context */}
                  {replyTo && (
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Reply className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Replying to:</span>
                          <span className="text-sm text-gray-800 truncate">
                            {(replyTo as any)?.text || "Previous message"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyTo(null)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div 
                    className={`p-4 border-t border-gray-200 bg-white transition-colors duration-200 sticky bottom-0 z-20 ${
                      dragActive ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <motion.div
                        className="mb-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Selected Files ({selectedFiles.length})
                          </h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedFiles([])}
                            className="text-red-600 hover:text-red-700"
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedFiles.map((file, index) => (
                            <motion.div
                              key={index}
                              className="relative group bg-white rounded-lg p-2 border border-gray-200"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                            >
                              {file.type.startsWith('image/') ? (
                                <div className="relative">
                                  <img
                                    src={getFilePreview(file)}
                                    alt={file.name}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {getFileTypeIcon(file.name)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                    onClick={() => removeFile(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              )}
                            </motion.div>
                          ))}
                </div>
                      </motion.div>
                    )}

                    {/* Drag and Drop Indicator */}
                    {dragActive && (
                      <motion.div
                        className="mb-3 p-4 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <Paperclip className="h-5 w-5" />
                          <span className="font-medium">Drop files here to upload</span>
              </div>
                      </motion.div>
                    )}

                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <Textarea
                          ref={textareaRef}
                          placeholder="Type your message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="min-h-[44px] max-h-32 resize-none pr-12"
                          rows={1}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={handleSend}
                        disabled={(!text.trim() && !attachmentUrl.trim() && selectedFiles.length === 0) || uploadingFiles}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {uploadingFiles ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Uploading...
                          </div>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    
                    {/* Attachment Input */}
                    {showAttachmentOptions && (
                      <motion.div
                        className="mt-3 p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                <Input
                  placeholder="Attachment URL (optional)"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span>Supported: Images, PDFs, Documents (Max 10MB)</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <MessageCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
                    <p className="text-gray-600">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Media Viewer Modal */}
        {mediaViewerOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full w-full">
              {/* Close Button */}
              <Button
                onClick={closeMediaViewer}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
                size="sm"
              >
                ×
              </Button>
              
              {/* Media Display */}
              <div className="relative">
                {currentMediaUrls[selectedMediaIndex] && (
                  <img
                    src={currentMediaUrls[selectedMediaIndex]}
                    alt={`Media ${selectedMediaIndex + 1}`}
                    className="w-full h-full max-h-[80vh] object-contain rounded-lg"
                  />
                )}
                
                {/* Navigation Arrows */}
                {currentMediaUrls.length > 1 && (
                  <>
                    <Button
                      onClick={() => setSelectedMediaIndex(prev => 
                        prev === 0 ? currentMediaUrls.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                      size="sm"
                    >
                      ←
                    </Button>
                <Button
                      onClick={() => setSelectedMediaIndex(prev => 
                        prev === currentMediaUrls.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                      size="sm"
                    >
                      →
                </Button>
                  </>
                )}
              </div>
              
              {/* Media Counter */}
              {currentMediaUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                  {selectedMediaIndex + 1} / {currentMediaUrls.length}
                </div>
              )}
            </div>
        </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
