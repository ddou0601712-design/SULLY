
import React, { useState, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { ChatTheme, BubbleStyle } from '../types';
import { processImage } from '../utils/file';

const DEFAULT_STYLE: BubbleStyle = {
    textColor: '#334155',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    opacity: 1,
    backgroundImageOpacity: 0.5,
    decorationX: 90,
    decorationY: -10,
    decorationScale: 1,
    decorationRotate: 0,
    avatarDecorationX: 50,
    avatarDecorationY: 50,
    avatarDecorationScale: 1,
    avatarDecorationRotate: 0
};

const DEFAULT_THEME: ChatTheme = {
    id: '',
    name: 'New Theme',
    type: 'custom',
    user: { ...DEFAULT_STYLE, textColor: '#ffffff', backgroundColor: '#6366f1' },
    ai: { ...DEFAULT_STYLE }
};

const ThemeMaker: React.FC = () => {
    const { closeApp, addCustomTheme, addToast } = useOS();
    const [editingTheme, setEditingTheme] = useState<ChatTheme>({ ...DEFAULT_THEME, id: `theme-${Date.now()}` });
    const [activeTab, setActiveTab] = useState<'user' | 'ai'>('user');
    const [toolSection, setToolSection] = useState<'base' | 'sticker' | 'avatar'>('base'); // New Sub-tabs
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const decorationInputRef = useRef<HTMLInputElement>(null);
    const avatarDecoInputRef = useRef<HTMLInputElement>(null);

    const activeStyle = editingTheme[activeTab];

    const updateStyle = (key: keyof BubbleStyle, value: any) => {
        setEditingTheme(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [key]: value
            }
        }));
    };

    const handleImageUpload = async (file: File, type: 'bg' | 'deco' | 'avatarDeco') => {
        try {
            const result = await processImage(file);
            if (type === 'bg') updateStyle('backgroundImage', result);
            else if (type === 'deco') updateStyle('decoration', result);
            else if (type === 'avatarDeco') updateStyle('avatarDecoration', result);
            addToast('图片上传成功', 'success');
        } catch (e: any) {
            addToast(e.message, 'error');
        }
    };

    const saveTheme = () => {
        if (!editingTheme.name.trim()) return;
        addCustomTheme(editingTheme);
        closeApp();
    };

    // Helper: Generate CSS for Bubble Preview
    const getBubbleContainerStyle = (style: BubbleStyle) => ({
        backgroundColor: style.backgroundColor,
        borderRadius: `${style.borderRadius}px`,
        opacity: style.opacity, // Overall container opacity
        borderBottomLeftRadius: activeTab === 'user' ? `${style.borderRadius}px` : '4px',
        borderBottomRightRadius: activeTab === 'user' ? '4px' : `${style.borderRadius}px`,
    });

    return (
        <div className="h-full w-full bg-slate-50 flex flex-col font-light relative">
            {/* Header */}
            <div className="h-20 bg-white/70 backdrop-blur-md flex items-end pb-3 px-4 border-b border-white/40 shrink-0 z-20 justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={closeApp} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-medium text-slate-700">气泡工坊</h1>
                </div>
                <button onClick={saveTheme} className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all">
                    保存
                </button>
            </div>

            {/* Preview Area (Realistic Chat Row) */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col p-6 justify-center items-center gap-4">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Simulated Chat Row */}
                <div className={`relative w-full max-w-sm flex items-end gap-3 ${activeTab === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar Preview */}
                    <div className="relative w-12 h-12 shrink-0">
                        {/* Base Avatar */}
                        <div className="w-full h-full rounded-full bg-slate-300 overflow-hidden relative z-0 shadow-sm border border-white/50">
                             <div className="absolute inset-0 flex items-center justify-center text-white/50 font-bold text-xs">IMG</div>
                        </div>
                        {/* Avatar Decoration Layer */}
                        {activeStyle.avatarDecoration && (
                            <img 
                                src={activeStyle.avatarDecoration}
                                className="absolute pointer-events-none z-10 max-w-none"
                                style={{
                                    left: `${activeStyle.avatarDecorationX ?? 50}%`,
                                    top: `${activeStyle.avatarDecorationY ?? 50}%`,
                                    width: `${48 * (activeStyle.avatarDecorationScale ?? 1)}px`, // Base size approx avatar size
                                    height: 'auto',
                                    transform: `translate(-50%, -50%) rotate(${activeStyle.avatarDecorationRotate ?? 0}deg)`,
                                }}
                            />
                        )}
                    </div>

                    {/* Bubble Preview */}
                    <div className="relative group max-w-[75%]">
                        {/* Sticker Layer */}
                        {activeStyle.decoration && (
                            <img 
                                src={activeStyle.decoration} 
                                className="absolute z-20 w-8 h-8 object-contain drop-shadow-sm pointer-events-none"
                                style={{
                                    left: `${activeStyle.decorationX ?? 90}%`,
                                    top: `${activeStyle.decorationY ?? -10}%`,
                                    transform: `translate(-50%, -50%) scale(${activeStyle.decorationScale ?? 1}) rotate(${activeStyle.decorationRotate ?? 0}deg)`
                                }}
                            />
                        )}

                        {/* Bubble Container */}
                        <div 
                            className="relative px-4 py-3 shadow-sm text-sm overflow-hidden" 
                            style={getBubbleContainerStyle(activeStyle)}
                        >
                            {/* Background Image Layer (Independent Opacity) */}
                            {activeStyle.backgroundImage && (
                                <div 
                                    className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
                                    style={{ 
                                        backgroundImage: `url(${activeStyle.backgroundImage})`,
                                        opacity: activeStyle.backgroundImageOpacity ?? 0.5
                                    }}
                                ></div>
                            )}
                            
                            {/* Text Layer (Relative Z-index to sit on top of bg image) */}
                            <span className="relative z-10 leading-relaxed" style={{ color: activeStyle.textColor }}>
                                {activeTab === 'user' ? "这个样式看起来怎么样？" : "我觉得非常棒，完全符合人设！"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Controls */}
            <div className="bg-white rounded-t-[2.5rem] shadow-[0_-5px_30px_rgba(0,0,0,0.08)] z-30 flex flex-col h-[55%] ring-1 ring-slate-100">
                {/* Main Tabs (User / AI) */}
                <div className="flex px-8 pt-6 pb-2 gap-6">
                    <button onClick={() => setActiveTab('user')} className={`text-sm font-bold transition-colors ${activeTab === 'user' ? 'text-slate-800' : 'text-slate-300'}`}>用户气泡</button>
                    <button onClick={() => setActiveTab('ai')} className={`text-sm font-bold transition-colors ${activeTab === 'ai' ? 'text-slate-800' : 'text-slate-300'}`}>角色气泡</button>
                </div>

                {/* Sub-Tool Tabs */}
                <div className="flex px-6 border-b border-slate-100 mb-2 overflow-x-auto no-scrollbar">
                    <button onClick={() => setToolSection('base')} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${toolSection === 'base' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>基础样式</button>
                    <button onClick={() => setToolSection('sticker')} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${toolSection === 'sticker' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>气泡贴纸</button>
                    <button onClick={() => setToolSection('avatar')} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${toolSection === 'avatar' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>头像挂件</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-20">
                    
                    {/* --- BASE STYLE TOOLS --- */}
                    {toolSection === 'base' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Name Input (Only on Base) */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">主题名称 (Theme Name)</label>
                                <input value={editingTheme.name} onChange={(e) => setEditingTheme(prev => ({...prev, name: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-primary/50 transition-all outline-none" placeholder="我的个性主题" />
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">文字颜色</label>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100"><input type="color" value={activeStyle.textColor} onChange={(e) => updateStyle('textColor', e.target.value)} className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent" /></div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">气泡颜色</label>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100"><input type="color" value={activeStyle.backgroundColor} onChange={(e) => updateStyle('backgroundColor', e.target.value)} className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent" /></div>
                                </div>
                            </div>

                            {/* Background Image Logic */}
                            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer group relative h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden hover:border-primary/50 hover:text-primary transition-all">
                                {activeStyle.backgroundImage ? (
                                    <>
                                        <img src={activeStyle.backgroundImage} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                        <span className="relative z-10 text-[10px] bg-white/80 px-2 py-1 rounded shadow-sm font-bold">更换底纹</span>
                                    </>
                                ) : <span className="text-xs font-bold">+ 上传底纹图片 (Texture)</span>}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'bg')} />
                                {activeStyle.backgroundImage && <button onClick={(e) => { e.stopPropagation(); updateStyle('backgroundImage', undefined); }} className="absolute top-2 right-2 text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full z-20">移除</button>}
                            </div>

                            {/* Sliders */}
                            {activeStyle.backgroundImage && (
                                <div>
                                    <div className="flex justify-between mb-2"><label className="text-[10px] font-bold text-slate-400 uppercase">背景透明度</label><span className="text-[10px] text-slate-500 font-mono">{Math.round((activeStyle.backgroundImageOpacity ?? 0.5) * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.05" value={activeStyle.backgroundImageOpacity ?? 0.5} onChange={(e) => updateStyle('backgroundImageOpacity', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary" />
                                </div>
                            )}
                            <div>
                                <div className="flex justify-between mb-2"><label className="text-[10px] font-bold text-slate-400 uppercase">圆角大小</label><span className="text-[10px] text-slate-500 font-mono">{activeStyle.borderRadius}px</span></div>
                                <input type="range" min="0" max="30" value={activeStyle.borderRadius} onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary" />
                            </div>
                        </div>
                    )}

                    {/* --- STICKER TOOLS --- */}
                    {toolSection === 'sticker' && (
                        <div className="space-y-6 animate-fade-in">
                            <div onClick={() => decorationInputRef.current?.click()} className="cursor-pointer group relative h-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary/50 hover:text-primary transition-all">
                                 {activeStyle.decoration ? <img src={activeStyle.decoration} className="h-10 w-10 object-contain" /> : <span className="text-xs font-bold">+ 上传气泡角标/贴纸</span>}
                                 <input type="file" ref={decorationInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'deco')} />
                                 {activeStyle.decoration && <button onClick={(e) => { e.stopPropagation(); updateStyle('decoration', undefined); }} className="absolute top-2 right-2 text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full">移除</button>}
                            </div>

                            {activeStyle.decoration && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-6 p-2">
                                    <div className="col-span-2"><label className="text-[10px] text-slate-400 uppercase block mb-2">位置坐标 (X / Y)</label>
                                        <div className="flex gap-3">
                                            <input type="range" min="-50" max="150" value={activeStyle.decorationX ?? 90} onChange={(e) => updateStyle('decorationX', parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-full accent-primary" />
                                            <input type="range" min="-50" max="150" value={activeStyle.decorationY ?? -10} onChange={(e) => updateStyle('decorationY', parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-full accent-primary" />
                                        </div>
                                    </div>
                                    <div><label className="text-[10px] text-slate-400 uppercase block mb-2">缩放 ({activeStyle.decorationScale ?? 1}x)</label>
                                        <input type="range" min="0.2" max="3" step="0.1" value={activeStyle.decorationScale ?? 1} onChange={(e) => updateStyle('decorationScale', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full accent-primary" />
                                    </div>
                                    <div><label className="text-[10px] text-slate-400 uppercase block mb-2">旋转 ({activeStyle.decorationRotate ?? 0}°)</label>
                                        <input type="range" min="-180" max="180" value={activeStyle.decorationRotate ?? 0} onChange={(e) => updateStyle('decorationRotate', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full accent-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- AVATAR TOOLS --- */}
                    {toolSection === 'avatar' && (
                        <div className="space-y-6 animate-fade-in">
                            <div onClick={() => avatarDecoInputRef.current?.click()} className="cursor-pointer group relative h-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary/50 hover:text-primary transition-all">
                                 {activeStyle.avatarDecoration ? <img src={activeStyle.avatarDecoration} className="h-10 w-10 object-contain" /> : <span className="text-xs font-bold">+ 上传头像框/挂件</span>}
                                 <input type="file" ref={avatarDecoInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatarDeco')} />
                                 {activeStyle.avatarDecoration && <button onClick={(e) => { e.stopPropagation(); updateStyle('avatarDecoration', undefined); }} className="absolute top-2 right-2 text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full">移除</button>}
                            </div>

                            {activeStyle.avatarDecoration && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-6 p-2">
                                    <div className="col-span-2"><label className="text-[10px] text-slate-400 uppercase block mb-2">中心偏移 (Offset X / Y)</label>
                                        <div className="flex gap-3">
                                            <input type="range" min="-50" max="150" value={activeStyle.avatarDecorationX ?? 50} onChange={(e) => updateStyle('avatarDecorationX', parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-full accent-primary" />
                                            <input type="range" min="-50" max="150" value={activeStyle.avatarDecorationY ?? 50} onChange={(e) => updateStyle('avatarDecorationY', parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-full accent-primary" />
                                        </div>
                                    </div>
                                    <div><label className="text-[10px] text-slate-400 uppercase block mb-2">缩放 ({activeStyle.avatarDecorationScale ?? 1}x)</label>
                                        <input type="range" min="0.5" max="3" step="0.1" value={activeStyle.avatarDecorationScale ?? 1} onChange={(e) => updateStyle('avatarDecorationScale', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full accent-primary" />
                                    </div>
                                    <div><label className="text-[10px] text-slate-400 uppercase block mb-2">旋转 ({activeStyle.avatarDecorationRotate ?? 0}°)</label>
                                        <input type="range" min="-180" max="180" value={activeStyle.avatarDecorationRotate ?? 0} onChange={(e) => updateStyle('avatarDecorationRotate', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full accent-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ThemeMaker;
