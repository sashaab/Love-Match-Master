
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { Celebrity, Cell } from "@/lib/types";
import { celebritiesData } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ZapOff, RotateCw, Trophy, Undo, HelpCircle, Users, UserX, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { shuffle } from 'lodash';

const GRID_SIZE = 16;
const COUPLES_TO_INCLUDE = 2;

const ScoreBoard = ({ score }: { score: number }) => (
  <div className="text-center mb-4">
    <h1 className="font-headline text-5xl md:text-6xl font-bold text-gray-800">Love Match Mania</h1>
    <p className="mt-2 text-2xl font-semibold text-primary">Score: {score}</p>
  </div>
);

const CelebrityCard = ({
  cell,
  index,
  isMatched,
  isFighting,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  cell: Cell;
  index: number;
  isMatched: boolean;
  isFighting: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}) => {
  if (cell.type === 'empty') {
    return (
      <div
        className="aspect-square rounded-lg bg-background/50 border-2 border-dashed border-gray-300"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      ></div>
    );
  }

  return (
    <Card
      draggable={!isMatched}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "aspect-square transition-all duration-300 ease-in-out transform hover:scale-105",
        "relative group overflow-hidden rounded-xl shadow-lg",
        isMatched ? "border-primary border-4 shadow-primary/50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
        isFighting && "animate-shake border-red-500 border-4 shadow-red-500/50"
      )}
    >
      <CardContent className="p-0 relative h-full w-full">
        <Image
          src={cell.imageUrl}
          alt={cell.name}
          width={150}
          height={150}
          className="w-full h-full object-cover"
          data-ai-hint="celebrity portrait"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <p className="absolute bottom-2 left-3 font-bold text-white text-sm md:text-base">
          {cell.name}
        </p>
        {isMatched && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <Heart className="w-16 h-16 text-white animate-pulse" fill="white" />
          </div>
        )}
        {isFighting && (
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
            <ZapOff className="w-16 h-16 text-white animate-ping" fill="white" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const HintSidebar = ({ couples, exes }: { couples: Celebrity[], exes: { p1: string, p2: string }[] }) => {
  const { setOpen } = useSidebar();
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const initialOpen = mediaQuery.matches;
    setOpen(initialOpen);

    const handler = (e: MediaQueryListEvent) => setOpen(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [setOpen]);

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="border-b border-sidebar-border bg-sidebar-accent">
           <div className="flex items-center gap-2 p-2 justify-center">
              <Star className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold font-headline text-sidebar-primary-foreground">Hints</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-sidebar">
          <div className="p-4 space-y-6">
            {couples.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-300">
                    <Users className="w-5 h-5" />
                    Match these couples!
                </h3>
                <ul className="space-y-2">
                  {couples.map((c, i) => (
                    <li key={i} className="text-sm bg-sidebar-accent/50 p-2 rounded-md">{c.name} & {c.partner}</li>
                  ))}
                </ul>
              </div>
            )}
            {exes.length > 0 && (
              <>
                {couples.length > 0 && <Separator className="bg-sidebar-border" />}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-400">
                      <UserX className="w-5 h-5"/>
                      Don't match these exes!
                  </h3>
                  <ul className="space-y-2">
                    {exes.map((e, i) => (
                      <li key={i} className="text-sm bg-sidebar-accent/50 p-2 rounded-md">{e.p1} & {e.p2}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </SidebarContent>
      </Sidebar>
  );
};


export default function Home() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [history, setHistory] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [fightingIds, setFightingIds] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameCouples, setGameCouples] = useState<Celebrity[]>([]);
  const [gameExes, setGameExes] = useState<{p1: string, p2: string}[]>([]);

  const draggedItem = useRef<number | null>(null);

  const setupGame = useCallback(() => {
    // 1. Find couples where at least one person has an ex.
    const potentialCouples = shuffle(celebritiesData.filter(c => 
        c.partner && (c.exes && c.exes.length > 0)
    ));
    
    // 2. Select the required number of couples for the game.
    const selectedCouples = potentialCouples.slice(0, COUPLES_TO_INCLUDE);
    setGameCouples(selectedCouples);
    
    let gameCelebs: Celebrity[] = [];
    const gameCelebsNames = new Set<string>();

    // 3. Add the selected couples and their partners to the game.
    for (const couplePerson of selectedCouples) {
        if (!gameCelebsNames.has(couplePerson.name)) {
            gameCelebs.push(couplePerson);
            gameCelebsNames.add(couplePerson.name);
        }
        const partner = celebritiesData.find(p => p.name === couplePerson.partner);
        if (partner && !gameCelebsNames.has(partner.name)) {
            gameCelebs.push(partner);
            gameCelebsNames.add(partner.name);
        }
    }

    // 4. Add all exes of the people in the game.
    const exesToAdd = new Set<string>();
    for (const celeb of gameCelebs) {
        if (celeb.exes) {
            for (const exName of celeb.exes) {
                if (!gameCelebsNames.has(exName)) {
                    exesToAdd.add(exName);
                }
            }
        }
    }

    exesToAdd.forEach(exName => {
        const exCeleb = celebritiesData.find(c => c.name === exName);
        if (exCeleb && !gameCelebsNames.has(exCeleb.name)) {
            gameCelebs.push(exCeleb);
            gameCelebsNames.add(exCeleb.name);
        }
    });

    // 5. Fill the rest of the grid with filler celebrities, avoiding duplicates.
    const fillers = shuffle(celebritiesData.filter(c => !gameCelebsNames.has(c.name)));
    const remainingSlots = GRID_SIZE - gameCelebs.length;
    if (remainingSlots > 0) {
        gameCelebs.push(...fillers.slice(0, remainingSlots));
    }
    
    let finalCells: Cell[] = gameCelebs.slice(0, GRID_SIZE).filter(c => c.id);
    
    // Ensure no duplicates
    const uniqueCelebs = Array.from(new Map(finalCells.map(c => [c.id, c])).values());
    finalCells = uniqueCelebs as Cell[];


    // 6. Add empty cells if the grid is not full.
    if (finalCells.length < GRID_SIZE) {
        const emptyCellsCount = GRID_SIZE - finalCells.length;
        for (let i = 0; i < emptyCellsCount; i++) {
            finalCells.push({ type: 'empty', id: `empty-${Date.now()}-${i}` });
        }
    }

    // 7. Determine the ex-pairs that are actually in the game.
    const exesInGame: { p1: string, p2: string }[] = [];
    const finalCelebNames = new Set(finalCells.filter(c => c.type === 'celebrity').map(c => (c as Celebrity).name));
    
    for (const celeb of finalCells) {
        if (celeb.type === 'celebrity' && celeb.exes) {
            for (const exName of celeb.exes) {
                if (finalCelebNames.has(exName)) {
                    if (!exesInGame.some(e => (e.p1 === exName && e.p2 === celeb.name) || (e.p1 === celeb.name && e.p2 === exName))) {
                        exesInGame.push({ p1: celeb.name, p2: exName });
                    }
                }
            }
        }
    }
    setGameExes(exesInGame);

    const isLayoutInvalid = (layout: Cell[]): boolean => {
      const gridWidth = Math.sqrt(GRID_SIZE);
      for (let i = 0; i < layout.length; i++) {
        const cell = layout[i];
        if (cell.type === 'empty') continue;

        const neighbors = [i - 1, i + 1, i - gridWidth, i + gridWidth].filter(n =>
          n >= 0 && n < layout.length &&
          !((i % gridWidth === 0 && n === i - 1) || ((i + 1) % gridWidth === 0 && n === i + 1))
        );

        for (const nIndex of neighbors) {
          const neighbor = layout[nIndex];
          if (neighbor.type === 'empty') continue;
          
          if (cell.partner === neighbor.name) return true; // Invalid if a couple is adjacent
          if (cell.exes?.includes(neighbor.name)) return true; // Invalid if exes are adjacent
        }
      }
      return false;
    };

    let shuffledCells;
    do {
      shuffledCells = shuffle(finalCells);
    } while (isLayoutInvalid(shuffledCells));
    
    setCells(shuffledCells);
    setHistory([shuffledCells]);
    setScore(0);
    setMatchedPairs(new Set());
    setFightingIds(new Set());
    setGameOver(false);
  }, []);

  const updateCells = (newCells: Cell[]) => {
    setHistory(prev => [...prev, newCells]);
    setCells(newCells);
  }

  const undoMove = () => {
    if (history.length > 1) {
      const lastState = history[history.length - 2];
      setCells(lastState);
      setHistory(prev => prev.slice(0, -1));
      setScore(prev => prev - 10); // Penalty for undo
    }
  }


  useEffect(() => {
    setIsClient(true);
    setupGame();
  }, [setupGame]);

  const checkMatches = useCallback(() => {
    let newFightingIds = new Set<string>();
    let newMatchedPairs = new Set(matchedPairs);
    let scoreDelta = 0;
    const gridWidth = Math.sqrt(GRID_SIZE);

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.type === 'empty') continue;

      const neighbors = [i - 1, i + 1, i - gridWidth, i + gridWidth].filter(n =>
        n >= 0 && n < cells.length &&
        !((i % gridWidth === 0 && n === i - 1) || ((i + 1) % gridWidth === 0 && n === i + 1))
      );

      for (const nIndex of neighbors) {
        const neighbor = cells[nIndex];
        if (neighbor.type === 'empty') continue;
        
        const isAlreadyMatched = newMatchedPairs.has(cell.id) || newMatchedPairs.has(neighbor.id);
        if (isAlreadyMatched) continue;

        if (cell.exes?.includes(neighbor.name)) {
          newFightingIds.add(cell.id);
          newFightingIds.add(neighbor.id);
        }

        if (cell.partner === neighbor.name) {
          newMatchedPairs.add(cell.id);
          newMatchedPairs.add(neighbor.id);
          scoreDelta += 100;
        }
      }
    }

    if (newFightingIds.size > 0) {
      setFightingIds(newFightingIds);
      if(newFightingIds.size !== fightingIds.size){
         setScore(prev => prev - 10 * newFightingIds.size);
      }
      setTimeout(() => setFightingIds(new Set()), 1000);
    } else {
      setFightingIds(new Set());
    }
    
    if(newMatchedPairs.size > matchedPairs.size) {
        setMatchedPairs(newMatchedPairs);
        setScore(prev => prev + scoreDelta);
    }
    
    if (newMatchedPairs.size === gameCouples.length * 2 && !gameOver && gameCouples.length > 0) {
      setGameOver(true);
    }
  }, [cells, matchedPairs, fightingIds.size, gameOver, gameCouples]);

  useEffect(() => {
    const timeoutId = setTimeout(checkMatches, 300);
    return () => clearTimeout(timeoutId);
  }, [cells, checkMatches]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (matchedPairs.has(cells[index].id)) {
        e.preventDefault();
        return;
    }
    draggedItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem.current === null) return;
    
    const draggedIndex = draggedItem.current;
    if (draggedIndex === index) return;
    
    const draggedCell = cells[draggedIndex];
    if (matchedPairs.has(draggedCell.id)) return;
    
    const targetCell = cells[index];
    
    const newCells = [...cells];
    [newCells[draggedIndex], newCells[index]] = [newCells[index], newCells[draggedIndex]];
    updateCells(newCells);
    draggedItem.current = null;
    
    if (targetCell.type === 'empty') {
      setScore(prev => prev - 1);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <SidebarProvider>
      <HintSidebar couples={gameCouples} exes={gameExes} />
      <SidebarInset>
        <main className="min-h-screen w-full bg-background p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-4">
               <SidebarTrigger>
                 <HelpCircle/>
              </SidebarTrigger>
              <div className="flex-grow">
                <ScoreBoard score={score} />
              </div>
              <div className="w-10"></div> {/* Spacer */}
            </div>
            
            <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
              {cells.map((cell, index) => (
                <CelebrityCard
                  key={cell.id}
                  cell={cell}
                  index={index}
                  isMatched={matchedPairs.has(cell.id)}
                  isFighting={fightingIds.has(cell.id)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            <div className="flex justify-center items-center gap-4">
              <Button onClick={setupGame} size="lg">
                <RotateCw className="mr-2 h-4 w-4" /> Reset Game
              </Button>
              <Button onClick={undoMove} size="lg" variant="outline" disabled={history.length <= 1}>
                <Undo className="mr-2 h-4 w-4" /> Undo
              </Button>
            </div>
          </div>
          <AlertDialog open={gameOver}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-center text-2xl font-headline">
                  <Trophy className="mr-4 h-10 w-10 text-yellow-500" />
                  Congratulations!
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-lg pt-4">
                  You've matched all the couples!
                  <br />
                  Your final score is: <span className="font-bold text-primary">{score}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={setupGame} className="w-full">
                  Play Again
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    