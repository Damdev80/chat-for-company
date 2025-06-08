import React, { useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import AttachmentOptions from "./AttachmentOptions";

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onTyping,
  onNotification
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(e);
    setShowEmojis(false);
    setShowAttachOptions(false);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    onTyping();
  };  return (
    <div className="border-t border-[#3C4043]/50 p-4 bg-gradient-to-r from-[#2C2C34]/95 to-[#252529]/95 backdrop-blur-md relative">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A8E6A3]/30 to-transparent"></div>
      
      {/* Emoji Picker */}
      {showEmojis && (
        <div className="absolute bottom-20 left-4 z-50 animate-in slide-in-from-bottom-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}      {/* Attachment Options */}
      {showAttachOptions && (
        <div className="absolute bottom-20 left-16 z-50 animate-in slide-in-from-bottom-2">
          <AttachmentOptions 
            onClose={() => setShowAttachOptions(false)} 
            onNotification={onNotification}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Botón de adjuntos */}        <button
          type="button"
          onClick={() => {
            setShowAttachOptions(!showAttachOptions);
            setShowEmojis(false);
          }}          className={`p-3 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043]/60 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-[#A8E6A3]/30 hover:scale-105 ${
            showAttachOptions ? 'bg-[#3C4043]/60 text-[#A8E6A3] border-[#A8E6A3]/30' : ''
          }`}
          title="Adjuntar archivo"
        >
          <Paperclip size={20} />
        </button>        {/* Input de mensaje */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Escribe un mensaje..."
            className="w-full px-4 py-3 bg-gradient-to-r from-[#1A1A1F]/80 to-[#1A1A1F]/60 backdrop-blur-md border border-[#2C2C34]/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/50 focus:border-[#A8E6A3]/30 text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200 hover:border-[#3C4043]/80"
            maxLength={1000}
          />
          {/* Character counter */}
          {newMessage.length > 800 && (
            <div className="absolute -top-6 right-0 text-xs text-[#B8B8B8] bg-[#2C2C34]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#3C4043]/40">
              {newMessage.length}/1000
            </div>
          )}
        </div>        {/* Botón de emojis */}
        <button
          type="button"
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowAttachOptions(false);
          }}          className={`p-3 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043]/60 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-[#A8E6A3]/30 hover:scale-105 ${
            showEmojis ? 'bg-[#3C4043]/60 text-[#A8E6A3] border-[#A8E6A3]/30' : ''
          }`}
          title="Agregar emoji"
        >
          <Smile size={20} />
        </button>        {/* Botón de enviar */}        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:bg-[#3C4043]/60 disabled:text-[#666] disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 border border-transparent hover:border-white/20 backdrop-blur-sm"
          title="Enviar mensaje"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
