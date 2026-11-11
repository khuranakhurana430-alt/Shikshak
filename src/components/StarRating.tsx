"use client";
import { Star } from "lucide-react";
import { useState } from "react";

export default function StarRating({ onRatingChange, initialRating = 0 }: { onRatingChange: (rating: number) => void, initialRating?: number }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5"
          onClick={() => {
            setRating(star);
            onRatingChange(star);
          }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hover || rating)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}