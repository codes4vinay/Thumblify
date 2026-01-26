import { SquareIcon, SparkleIcon, ImageIcon, PenBoxIcon, CpuIcon, ChevronDownIcon } from "lucide-react";
import type { ThumbnailStyle } from "../assets/assets"

const StyleSelector = ({ value, onChange, isOpen, setIsOpen }: { value: ThumbnailStyle; onChange: (style: ThumbnailStyle) => void; isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {

    const styleDescriptions: Record<ThumbnailStyle, string> = {
        "Bold & Graphic": "High contrast, bold typography, striking visuals",
        "Minimalist": "Clean, simple design with ample white space",
        "Photorealistic": "Realistic images with natural colors and lighting",
        "Illustrated": "Hand-drawn or digital illustrations with vibrant colors",
        "Tech & Futuristic": "Modern design with sleek lines and tech-inspired elements",
    };

    const styleIcons: Record<ThumbnailStyle, React.ReactNode> = {
        "Bold & Graphic": <SparkleIcon className="h-4 w-4" />,
        "Minimalist": <SquareIcon />,
        "Photorealistic": <ImageIcon />,
        "Illustrated": <PenBoxIcon />,
        "Tech & Futuristic": <CpuIcon />,
    };

  return (
      <div className="relative space-y-3 dark">
          <label className="block text-sm font-medium text-zinc-200">Thumbnail Style</label>

          <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3.5 rounded-lg bg-zinc-800 border border-zinc-700 text-left text-white focus:outline-none focus:ring-2 focus:ring-pink-500 flex justify-between items-center">
              <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                      {styleIcons[value]}
                        <span>{value}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{styleDescriptions[value]}</p>
              </div>
              <ChevronDownIcon className={['h-5 w-5 text-zinc-400 transition-transform', isOpen &&  'rotate-180'].join(' ')} />
          </button>

          {isOpen && (
              <div className="absolute z-50 mt-1 w-full border border-white/12 bg-black/20 backdrop-blur-3xl rounded-md shadow-lg">
                  {Object.keys(styleDescriptions).map((styleKey) => {
                      const style = styleKey as ThumbnailStyle;
                      return (
                          <button
                              key={style}
                              type="button"
                              onClick={() => {
                                  onChange(style);
                                  setIsOpen(false);
                              }}
                              className="w-full px-4 py-3.5 text-left text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500 flex items-center gap-2"
                          >
                              <div className="mt-0.5">{styleIcons[style]}</div>
                              <div>
                                  <p className="font-medium">{style}</p>
                                  <p className="text-xs text-zinc-400">{styleDescriptions[style]}</p>
                             </div>
                          </button>
                      );
                  })}
              </div>
          )}
      </div>
  )
}

export default StyleSelector