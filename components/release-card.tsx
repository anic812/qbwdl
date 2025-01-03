import { formatArtists, formatTitle, getAlbum, formatDuration, QobuzAlbum, QobuzTrack, FetchedQobuzAlbum } from '@/lib/qobuz-dl'
import { cn } from '@/lib/utils'
import { AlignJustifyIcon, DownloadIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { useStatusBar } from '@/lib/status-bar/context'
import axios from 'axios'
import { useFFmpeg } from '@/lib/ffmpeg-provider'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { motion } from 'motion/react'
import { createDownloadJob } from '@/lib/download-job'
import { useSettings } from '@/lib/settings-provider'

const ReleaseCard = ({ result, resolvedTheme }: { result: QobuzAlbum | QobuzTrack, resolvedTheme: "dark" | "light" }) => {
    const { ffmpegState } = useFFmpeg();
    const { setStatusBar } = useStatusBar();
    const { settings } = useSettings();

    const [openTracklist, setOpenTracklist] = useState(false);

    const [fetchedAlbumData, setFetchedAlbumData] = useState<FetchedQobuzAlbum | null>(null);

    return (
        <div
            className="space-y-2"
            title={formatTitle(result)}
        >
            <div className='relative w-full aspect-square group select-none rounded-sm overflow-hidden'>
                <div className={cn("w-full z-[3] backdrop-blur-md top-0 left-0 absolute transition-all aspect-square opacity-0 group-hover:opacity-100",
                    resolvedTheme === 'dark'
                        ? 'group-hover:bg-black/30'
                        : 'group-hover:bg-white/50',
                )}>
                    <div className="flex flex-col h-full justify-between">
                        <div className="space-y-0.5 p-4">
                            <p className='text-sm truncate capitalize font-bold'>{getAlbum(result).genre.name}</p>
                            <p className='text-xs truncate capitalize font-medium'>{new Date(getAlbum(result).released_at * 1000).getFullYear()}</p>
                            <p className={cn('text-[10px] truncate font-semibold')}>{`${result.maximum_bit_depth}-bit ${result.maximum_sampling_rate} kHz`}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-2">
                            <Button
                                size='icon'
                                variant='ghost'
                                onClick={async () => {
                                    await createDownloadJob(result, setStatusBar, ffmpegState, settings, fetchedAlbumData, setFetchedAlbumData);
                                }}
                            >
                                <DownloadIcon />
                            </Button>
                            {(result as QobuzTrack).album ? null : 
                                    <Button size='icon' variant='ghost' onClick={async () => {
                                        setOpenTracklist(!openTracklist);
                                        if (!fetchedAlbumData) {
                                            const albumDataResponse = await axios.get("/api/get-album", { params: { album_id: (result as QobuzAlbum).id } });
                                            setFetchedAlbumData(albumDataResponse.data.data);
                                        }
                                    }}>
                                        <AlignJustifyIcon />
                                    </Button>
                            }
                        </div>
                    </div>
                </div>
                <img
                    src={(result as QobuzAlbum)?.image?.small || (result as QobuzTrack)?.album?.image?.small}
                    alt={formatTitle(result)}
                    crossOrigin="anonymous"
                    className={cn('absolute left-0 top-0 z-[1] w-full aspect-square group-hover:scale-105 transition-all')}
                />
            </div>
            <div className="space-y-1">
                <h1 className='text-sm truncate font-bold group-hover:underline'>
                    {formatTitle(result)}
                </h1>
                <p className='text-xs truncate' title={formatArtists(result)}>
                    {formatArtists(result)}
                </p>
            </div>
            <Dialog open={openTracklist} onOpenChange={setOpenTracklist}>
                <DialogContent className='w-[600px] max-w-[90%] md:max-w-[80%] overflow-hidden'>
                    <div className="flex gap-3 overflow-hidden">
                        <img src={(result as QobuzAlbum)?.image?.small || (result as QobuzTrack)?.album?.image?.small} alt={formatTitle(result)} crossOrigin='anonymous' height={100} width={100} className='aspect-square' />
                        <div className="flex flex-col justify-between overflow-hidden">
                            <div className="space-y-1.5 overflow-hidden">
                                <DialogTitle className='truncate'>{formatTitle(getAlbum(result))}</DialogTitle>
                                <DialogDescription className='truncate'>{formatArtists(result)}</DialogDescription>
                            </div>
                            <div className="space-y-1.5 w-fit">
                                <DialogDescription className='truncate'>{getAlbum(result).tracks_count} {getAlbum(result).tracks_count > 1 ? "tracks" : "track"} - {formatDuration(getAlbum(result).duration)}</DialogDescription>
                            </div>
                        </div>
                    </div>
                    <Separator />
                        {fetchedAlbumData && <ScrollArea className='max-h-[40vh]'>
                            <motion.div
                                initial={{ maxHeight: "0vh" }}
                                animate={{ maxHeight: "40vh" }}
                            >
                                <div className="flex flex-col overflow-hidden pr-3">
                                    {fetchedAlbumData.tracks.items.map((track: QobuzTrack, index: number) => {
                                        track.album = getAlbum(result);
                                        return (
                                            <div key={track.id}>                                            
                                                <div className='flex items-center justify-between gap-2 overflow-hidden hover:bg-primary/5 transition-all p-2 rounded group'>
                                                    <div className="gap-2 flex items-center overflow-hidden">
                                                        <span className='text-muted-foreground text-sm'>{index + 1}</span>
                                                        <p className='truncate font-medium'>{formatTitle(track)}</p>
                                                    </div>
                                                    <Button className='md:group-hover:flex md:hidden justify-center aspect-square h-6 w-6 [&_svg]:size-5 hover:bg-transparent' size="icon" variant='ghost' onClick={async () => {
                                                        await createDownloadJob(track, setStatusBar, ffmpegState, settings);
                                                        setOpenTracklist(false);
                                                    }}>
                                                        <DownloadIcon />
                                                    </Button>
                                                </div>
                                                {index < fetchedAlbumData.tracks.items.length - 1 && <Separator />}
                                            <div/>
                                        </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </ScrollArea>}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ReleaseCard