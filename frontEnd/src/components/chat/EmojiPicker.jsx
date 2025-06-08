import React from "react";
import { commonEmojis } from "../../utils/chatUtils";

const EmojiPicker = ({ onEmojiSelect }) => {
  return (
    <div className="bg-gradient-to-br from-[#2C2C34] to-[#252529] border border-[#3C4043] rounded-xl p-4 w-72 animate-in slide-in-from-bottom-2 duration-200">
      <div className="text-sm font-semibold text-[#A8E6A3] mb-3 border-b border-[#3C4043] pb-2">
        Emojis frecuentes
      </div>
      <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#A8E6A3] scrollbar-track-[#3C4043]">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="w-9 h-9 flex items-center justify-center text-lg hover:bg-[#3C4043] rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
