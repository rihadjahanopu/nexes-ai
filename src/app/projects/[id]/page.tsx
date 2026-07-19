'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { useParams } from 'next/navigation';
import { 
  Loader2, Send, FileText, UploadCloud, Edit2, Trash2, 
  Save, X, Eraser, Bot, Clock, AlertTriangle, Download, Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useConfirm } from '@/components/ui/ConfirmDialog';

interface Message {
  _id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const confirm = useConfirm();
  
  const [project, setProject] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingDoc, setIsDeletingDoc] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjectData = async () => {
    try {
      const [projRes, chatRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/chat/${id}`)
      ]);
      setProject(projRes.data.data);
      setMessages(chatRes.data.data || []);
    } catch (error) {
      console.error('Failed to load project data', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editDesc.trim()) {
      toast.error('Title and description cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.put(`/projects/${id}`, { title: editTitle, description: editDesc });
      if (res.data.success) {
        setProject(res.data.data);
        setIsEditing(false);
        toast.success('Project updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Project',
      description: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      const res = await api.delete(`/projects/${id}`);
      if (res.data.success) {
        toast.success('Project deleted');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleClearChat = async () => {
    const ok = await confirm({
      title: 'Clear Chat History',
      description: 'Are you sure you want to clear all chat messages? This cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!ok) return;
    setIsClearing(true);
    try {
      await api.delete(`/chat/${id}/clear`);
      setMessages([]);
      toast.success('Chat cleared!');
    } catch (error: any) {
      toast.error('Failed to clear chat');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteMessage = async (msgId: string | undefined, idx: number) => {
    if (!msgId) {
      // Fallback: remove by index from local state
      setMessages(prev => prev.filter((_, i) => i !== idx));
      return;
    }
    setDeletingMsgId(msgId);
    try {
      const res = await api.delete(`/chat/${id}/message/${msgId}`);
      if (res.data.success) {
        setMessages(res.data.data);
        toast.success('Message deleted');
      }
    } catch (error: any) {
      toast.error('Failed to delete message');
    } finally {
      setDeletingMsgId(null);
    }
  };

  const handleDownloadMessage = (content: string, role: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-generated-${role}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteDocument = async (docId: string) => {
    const ok = await confirm({
      title: 'Delete Document',
      description: 'Are you sure you want to delete this document? It will be permanently removed.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!ok) return;
    setIsDeletingDoc(docId);
    try {
      await api.delete(`/projects/${id}/documents/${docId}`);
      setProject((prev: any) => ({
        ...prev,
        documents: prev.documents.filter((d: any) => d._id !== docId)
      }));
      toast.success('Document deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsDeletingDoc(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/projects/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProject((prev: any) => ({
          ...prev,
          documents: [...(prev.documents || []), res.data.data]
        }));
        toast.success('File uploaded successfully!', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: Message = { role: 'user', content: inputMsg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
    setSending(true);

    try {
      const res = await api.post(`/chat/${id}`, { message: newMsg.content });
      if (res.data.success) {
        // Refresh messages to get proper _ids
        const chatRes = await api.get(`/chat/${id}`);
        setMessages(chatRes.data.data || []);
      }
    } catch (error: any) {
      toast.error('Failed to get response from agent');
      // Remove the optimistic user message
      setMessages(prev => prev.filter(m => m !== newMsg));
    } finally {
      setSending(false);
    }
  };

  // Group messages by date for history panel
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric' 
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );
  if (!project) return <div className="text-center p-20">Project not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <div className="flex-1 container mx-auto p-4 md:p-8 pt-24 md:pt-28 flex flex-col md:flex-row gap-6" style={{ height: '100dvh', maxHeight: '100dvh' }}>
        
        {/* Left Panel: Project Details */}
        <div className={`w-full md:w-1/3 flex-col gap-4 overflow-y-auto pb-4 min-h-0 ${showMobileSidebar ? 'flex' : 'hidden md:flex'}`}>
          <Card className="relative overflow-hidden shrink-0">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2 w-full">
                {isEditing ? (
                  <div className="flex-1 w-full min-w-0">
                    <Input 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)} 
                      className="font-bold text-lg w-full" 
                      placeholder="Project Title"
                    />
                  </div>
                ) : (
                  <CardTitle className="text-2xl break-words leading-tight flex-1">{project.title}</CardTitle>
                )}
                
                <div className="flex gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleUpdate} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                        setEditTitle(project.title);
                        setEditDesc(project.description);
                        setIsEditing(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setShowMobileSidebar(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {!isEditing && (
                <CardDescription>
                  <span className="inline-block px-2 py-1 mt-2 text-xs rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {project.status.toUpperCase()}
                  </span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2 text-sm">Objective</h4>
              {isEditing ? (
                <textarea 
                  className="w-full min-h-[120px] p-3 text-sm rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Project Description"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-center">
                Knowledge Base
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.pptx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.documents?.length > 0 ? (
                <div className="space-y-2">
                  {project.documents.map((doc: any, i: number) => (
                    <div key={doc._id || i} className="group flex items-center text-sm p-2 border rounded hover:bg-muted gap-2">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0"/>
                      <span className="truncate flex-1">{doc.filename}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleDeleteDocument(doc._id)}
                        disabled={isDeletingDoc === doc._id}
                      >
                        {isDeletingDoc === doc._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No documents uploaded yet. Upload PDFs or DOCX to provide context to your agent.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat History Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle 
                className="text-lg flex items-center justify-between cursor-pointer"
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Chat History
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {messages.length} msgs
                </span>
              </CardTitle>
            </CardHeader>
            {showHistoryPanel && (
              <CardContent className="max-h-60 overflow-y-auto space-y-3 pt-0">
                {Object.keys(groupedMessages).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No chat history yet.</p>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{date}</p>
                      {msgs.map((msg, i) => (
                        <div key={i} className={`text-xs p-2 rounded mb-1 truncate ${
                          msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                        }`}>
                          <span className="font-medium">{msg.role === 'user' ? 'You' : 'Agent'}:</span> {msg.content.substring(0, 50)}...
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Panel: Agent Chat */}
        <Card className={`w-full md:w-2/3 flex-col min-h-0 shadow-lg border-primary/20 overflow-hidden ${showMobileSidebar ? 'hidden' : 'flex'}`}>
          <CardHeader className="border-b bg-card rounded-t-xl py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2" 
                  onClick={() => setShowMobileSidebar(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-inner hidden sm:flex">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Nexus Agent</CardTitle>
                  <CardDescription className="text-xs">Your autonomous project copilot</CardDescription>
                </div>
              </div>
              
              {/* Clear Chat Button */}
              {messages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearChat}
                  disabled={isClearing}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 gap-2"
                >
                  {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          
          {/* Messages — this div scrolls */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {messages.length === 0 && (
              <div className="m-auto text-center max-w-sm">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Hello! I'm your Agent.</h3>
                <p className="text-muted-foreground text-sm">
                  I can help you analyze documents, draft strategies, and break down this project into tasks. What should we do first?
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={msg._id || i} className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'model' && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className={`rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted border border-border rounded-tl-sm'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                    <span className={`text-[10px] mt-1 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* Message Actions */}
                  <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      msg.role === 'user' ? 'self-end' : 'self-start'
                    }`}>
                    {msg.role === 'model' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleDownloadMessage(msg.content, msg.role)}
                      >
                        <Download className="h-3 w-3 mr-1" /> Download
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteMessage(msg._id, i)}
                      disabled={deletingMsgId === msg._id}
                    >
                      {deletingMsgId === msg._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <><Trash2 className="h-3 w-3 mr-1" /> Delete</>
                      )}
                    </Button>
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 text-primary text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))}
            
            {sending && (
              <div className="flex justify-start gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-muted border border-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-card border-t rounded-b-xl shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask your agent to perform a task..."
                className="flex-1 rounded-full px-6 h-12"
                disabled={sending}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-full shrink-0" disabled={sending || !inputMsg.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
        
      </div>
    </div>
  );
}
