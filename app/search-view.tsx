"use client"

import SearchBar from '@/components/search-bar';
import React, { JSX, useEffect, useState } from 'react'
import axios from 'axios';
import { SearchIcon, Loader2Icon, Disc3Icon, DiscAlbumIcon } from 'lucide-react';
import { QobuzAlbum, QobuzSearchResults, QobuzTrack } from '@/lib/qobuz-dl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import ReleaseCard from '@/components/release-card';
import { useInView } from "react-intersection-observer";

const SearchView = () => {
    const [searchIcon, setSearchIcon] = useState<JSX.Element>(<SearchIcon className='!size-5' />);
    const { resolvedTheme } = useTheme();
    const [results, setResults] = useState<QobuzSearchResults | null>(null);
    const [searchField, setSearchField] = useState<"albums" | "tracks">('albums');
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const filterData = [
        {
            label: "Albums",
            value: 'albums',
            icon: DiscAlbumIcon
        },
        {
            label: "Tracks",
            value: 'tracks',
            icon: Disc3Icon
        }
    ]
    const FilterIcon = filterData.find((fd) => fd.value == searchField)?.icon || Disc3Icon;

    const [scrollTrigger, isInView] = useInView();

    const fetchMore = () => {
        setLoading(true);
        axios.get(`/api/get-music?q=${query}&offset=${results![searchField].items.length}`)
            .then((response) => {
                if (response.status === 200) {
                    let newResults = { ...results!, [searchField]: { ...results!.albums, items: [...results!.albums.items, ...response.data.data.albums.items] } }
                    filterData.map((filter) => {
                        newResults = { ...newResults, [filter.value]: { ...results![filter.value as "albums" | "tracks"], items: [...results![filter.value as "albums" | "tracks"].items, ...response.data.data[filter.value].items] } }
                    })
                    setLoading(false);
                    setResults(newResults);
                }
            });
    }

    useEffect(() => {
        if (results === null) return;
        if (results![searchField].total > results![searchField].items.length) {
            fetchMore();
        }
    }, [searchField])

    useEffect(() => {
        if (isInView && results![searchField].total > results![searchField].items.length && !loading) {
            fetchMore();
        }
    }, [isInView, results]);

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold text-center">Qobuz-DL</h1>
                    <p className='text-md text-center font-medium text-muted-foreground'>The simplest music downloader</p>
                </div>
                <div className="flex flex-col items-start justify-center">
                    <SearchBar icon={searchIcon} onSearch={async (query: string) => {
                        setSearchIcon(<Loader2Icon className='animate-spin !size-5' />);
                        setQuery(query);
                        const response = await axios.get(`/api/get-music?q=${query}&offset=0`);
                        if (response.status === 200) {
                            setLoading(false);
                            setResults(response.data.data);
                        }
                        setSearchIcon(<SearchIcon className='!size-5' />);
                    }} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline' className='my-2 flex gap-2 focus-visible:outline-none focus-visible:ring-transparent select-none shadow-none outline-none'>
                                <FilterIcon />
                                <span className='capitalize'>{searchField}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup value={searchField} onValueChange={setSearchField as React.Dispatch<React.SetStateAction<string>>}>
                                {filterData.map((type, index) => (
                                    <DropdownMenuRadioItem
                                        key={index}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div>
                {results && <div className="my-6 w-screen mx-auto max-w-[1600px]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 w-full px-6">
                        {results![searchField].items.map((result: QobuzAlbum | QobuzTrack, index: number) => {
                            return (
                                <ReleaseCard
                                    key={result.id}
                                    result={result}
                                    resolvedTheme={resolvedTheme as "dark" | "light" || "dark" as const}
                                />
                            )
                        })}
                    </div>
                    <div className='flex w-full items-center text-center my-6 justify-center font-semibold p-2' ref={scrollTrigger}>
                        {results![searchField].total <= results![searchField].items.length && <p>No more {searchField} to load...</p>}
                    </div>
                </div>}
            </div>
        </>
    )
}

export default SearchView