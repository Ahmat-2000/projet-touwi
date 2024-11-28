import React, { useState, useRef, useEffect } from 'react';

const CustomVideoPlayer = ({ videoRef, videoUrl, cropVideoStart, cropVideoEnd }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const progressBarRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;

        const handleTimeUpdate = () => {
            const progress = (video.currentTime / video.duration) * 100;
            setProgress(progress);
        };

        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        video.addEventListener('timeupdate', handleTimeUpdate);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleProgressBarClick = (e) => {
        const progressBar = progressBarRef.current;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const toggleMute = () => {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    };

    const toggleFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            playerRef.current.requestFullscreen();
        }
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error("PiP failed:", error);
        }
    };

    return (
        <div className="relative w-full max-w-[600px] bg-black rounded-xl overflow-hidden" ref={playerRef}>
            <div className="w-full aspect-video">
                <video ref={videoRef} className="w-full h-full cursor-pointer">
                    {videoUrl && <source src={videoUrl} type="video/webm" />}
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 opacity-0 transition-opacity duration-300 hover:opacity-100">

                <div className="flex justify-between items-center">
                    <div className="flex gap-2.5">
                        <button onClick={toggleMute} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'}`} />
                        </button>
                    </div>

                    <div className="flex gap-2.5">
                        <button onClick={togglePiP} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className="fas fa-external-link-alt" />
                        </button>

                        <button onClick={toggleFullScreen} className="text-white p-1.5 rounded-full hover:bg-white/20 transition-colors w-8 h-8 flex items-center justify-center">
                            <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`} />
                        </button>
                    </div>
                </div>
                <div className="relative w-full mb-2.5">
                    <div
                        className="w-full h-2.5 bg-white/30 cursor-pointer rounded"
                        ref={progressBarRef}
                        onClick={handleProgressBarClick}
                    >
                        <div
                            className="h-full bg-[#297DCB] rounded transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="absolute inset-0 pointer-events-none">
                        {cropVideoStart !== null && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-green-500 -translate-x-1/2 group"
                                style={{
                                    left: `${(cropVideoStart / videoRef.current?.duration || 0) * 100}%`
                                }}
                            >
                                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Start: {cropVideoStart?.toFixed(2)}s
                                </span>
                            </div>
                        )}

                        {cropVideoEnd !== null && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-500 -translate-x-1/2 group"
                                style={{
                                    left: `${(cropVideoEnd / videoRef.current?.duration || 0) * 100}%`
                                }}
                            >
                                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    End: {cropVideoEnd?.toFixed(2)}s
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;