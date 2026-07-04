"use client";

import { memo } from "react";

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
  "😋", "😎", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗",
  "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥",
  "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝",
  "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁",
  "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩",
  "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "😡",
  "😠", "🤬", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌",
  "👐", "🤲", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "🤙", "👌",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "💖",
  "🔥", "✨", "⭐", "🎉", "🎊", "🎈", "💯", "✅", "❌", "💀",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full left-0 mb-2 z-50">
      <div className="glass-strong rounded-xl p-3 shadow-2xl w-[320px] max-h-[200px] overflow-y-auto">
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-glass-hover rounded-lg transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(EmojiPicker);
