import { useVideoPlayer } from "expo-video";

export function useVideoPlayerSafe(url: string | null | undefined) {
    const fallbackUrl =
      "https://cdn.pixabay.com/video/2021/09/25/89626-614773847_large.mp4";
  
    const player = useVideoPlayer(url || fallbackUrl);
    const isValid = url && url.trim().length > 0;
  
    return { player, isValid };
  }