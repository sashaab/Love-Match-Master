
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { Celebrity, Cell } from "@/lib/types";
import { celebritiesData } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ZapOff, RotateCw, Trophy, Undo, HelpCircle, Users, UserX, Star, Lock } from "lucide-react";
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
  SidebarInset
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { shuffle } from 'lodash';

const GRID_SIZE = 16;
const COUPLES_TO_INCLUDE = 2;
const COUPLE_HINT_COST = 100;
const EX_HINT_COST = 50;

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
  isSelected,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
}: {
  cell: Cell;
  index: number;
  isMatched: boolean;
  isFighting: boolean;
  isSelected: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onClick: (index: number) => void;
}) => {
  if (cell.type === 'empty') {
    return (
      <div
        className="aspect-square rounded-lg bg-background/50 border-2 border-dashed border-gray-300"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
        onClick={() => onClick(index)}
      ></div>
    );
  }

  return (
    <Card
      draggable={!isMatched}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onClick={() => onClick(index)}
      className={cn(
        "aspect-square transition-all duration-300 ease-in-out transform hover:scale-105",
        "relative group overflow-hidden rounded-xl shadow-lg",
        isMatched ? "border-primary border-4 shadow-primary/50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
        isFighting && "animate-shake border-red-500 border-4 shadow-red-500/50",
        isSelected && !isMatched && "ring-4 ring-blue-500 ring-offset-2"
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

const HintSidebar = ({
  couples,
  exes,
  onUnlockCouple,
  onUnlockEx,
  unlockedCouplesCount,
  unlockedExesCount,
  score,
}: {
  couples: Celebrity[],
  exes: { p1: string, p2: string }[],
  onUnlockCouple: () => void,
  onUnlockEx: () => void,
  unlockedCouplesCount: number,
  unlockedExesCount: number,
  score: number
}) => {
  const revealedCouples = couples.slice(0, unlockedCouplesCount);
  const revealedExes = exes.slice(0, unlockedExesCount);

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
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-300">
              <Users className="w-5 h-5" />
              Match these couples!
            </h3>
            <ul className="space-y-2 mb-4">
              {revealedCouples.map((c, i) => (
                <li key={`couple-${i}`} className="text-sm bg-sidebar-accent/50 p-2 rounded-md">{c.name} & {c.partner}</li>
              ))}
              {Array.from({ length: couples.length - unlockedCouplesCount }).map((_, i) => (
                <li key={`locked-couple-${i}`} className="text-sm bg-sidebar-accent/50 p-2 rounded-md flex items-center justify-center">
                  <Lock className="w-4 h-4 mr-2" />
                  <span>Locked</span>
                </li>
              ))}
            </ul>
            {unlockedCouplesCount < couples.length && (
              <Button onClick={onUnlockCouple} className="w-full">
                <Lock className="mr-2" /> Unlock for {COUPLE_HINT_COST} points
              </Button>
            )}
          </div>

          <Separator className="bg-sidebar-border" />

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-400">
              <UserX className="w-5 h-5" />
              Don't match these exes!
            </h3>
             <ul className="space-y-2 mb-4">
              {revealedExes.map((e, i) => (
                <li key={`ex-${i}`} className="text-sm bg-sidebar-accent/50 p-2 rounded-md">{e.p1} & {e.p2}</li>
              ))}
              {Array.from({ length: exes.length - unlockedExesCount }).map((_, i) => (
                 <li key={`locked-ex-${i}`} className="text-sm bg-sidebar-accent/50 p-2 rounded-md flex items-center justify-center">
                   <Lock className="w-4 h-4 mr-2" />
                   <span>Locked</span>
                 </li>
              ))}
            </ul>
            {unlockedExesCount < exes.length && (
              <Button onClick={onUnlockEx} className="w-full">
                <Lock className="mr-2" /> Unlock for {EX_HINT_COST} points
              </Button>
            )}
          </div>
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
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [unlockedCouplesCount, setUnlockedCouplesCount] = useState(0);
  const [unlockedExesCount, setUnlockedExesCount] = useState(0);

  const draggedItem = useRef<number | null>(null);

  const setupGame = useCallback(() => {
    let potentialCouples = celebritiesData.filter(c => 
        c.partner && celebritiesData.find(p => p.name === c.partner) && (c.exes && c.exes.length > 0)
    );
    
    let selectedCouples: Celebrity[] = [];
    let selectedExesForCouples: { p1: string, p2: string }[] = [];
    let celebsForGrid = new Set<string>();

    while (selectedCouples.length < COUPLES_TO_INCLUDE && potentialCouples.length > 0) {
        const coupleCandidate = potentialCouples.pop()!;
        const partner = celebritiesData.find(p => p.name === coupleCandidate.partner)!;
        
        const exesOfCandidate = coupleCandidate.exes || [];
        const exesOfPartner = partner.exes || [];
        const allExesForPair = [...new Set([...exesOfCandidate, ...exesOfPartner])];

        const exCelebsInGame = allExesForPair.map(name => celebritiesData.find(c => c.name === name)).filter(Boolean) as Celebrity[];

        const tempCelebs = new Set([coupleCandidate.name, partner.name, ...exCelebsInGame.map(c => c.name)]);
        if (celebsForGrid.size + tempCelebs.size > GRID_SIZE) {
            continue; // Not enough space for this couple and their exes
        }

        let coupleHasValidExPair = false;
        for (const celeb of [coupleCandidate, partner]) {
            if (celeb.exes) {
                for (const exName of celeb.exes) {
                    if (exCelebsInGame.find(c => c.name === exName)) {
                        coupleHasValidExPair = true;
                        selectedExesForCouples.push({p1: celeb.name, p2: exName});
                    }
                }
            }
        }
        
        if (coupleHasValidExPair) {
            selectedCouples.push(coupleCandidate);
            celebsForGrid.add(coupleCandidate.name);
            celebsForGrid.add(partner.name);
            exCelebsInGame.forEach(ex => celebsForGrid.add(ex.name));
        }
    }
    
    setGameCouples(selectedCouples);
    
    const fillers = shuffle(celebritiesData.filter(c => !celebsForGrid.has(c.name)));
    const remainingSlots = GRID_SIZE - celebsForGrid.size;
    if (remainingSlots > 0) {
        fillers.slice(0, remainingSlots).forEach(f => celebsForGrid.add(f.name));
    }
    
    let finalCells: Cell[] = Array.from(celebsForGrid).map(name => {
        const celeb = celebritiesData.find(c => c.name === name)!;
        return {...celeb, type: 'celebrity' as const};
    });
    
    if (finalCells.length < GRID_SIZE) {
        const emptyCellsCount = GRID_SIZE - finalCells.length;
        for (let i = 0; i < emptyCellsCount; i++) {
            finalCells.push({ type: 'empty', id: `empty-${Date.now()}-${i}` });
        }
    }

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
          
          if (cell.partner === neighbor.name) return true;
          if (cell.exes?.includes(neighbor.name)) return true;
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
    setSelectedCardIndex(null);
    setUnlockedCouplesCount(0);
    setUnlockedExesCount(0);
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
    }
  }


  useEffect(() => {
    setIsClient(true);
    setupGame();
  }, [setupGame]);

  const checkMatches = useCallback(() => {
    if (gameOver) return;
    let newFightingIds = new Set<string>();
    let newMatchedPairs = new Set(matchedPairs);
    let scoreDelta = 0;
    const gridWidth = Math.sqrt(GRID_SIZE);
    const currentlyFightingPairs = new Set<string>();

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
          const pairKey = [cell.name, neighbor.name].sort().join('-');
          currentlyFightingPairs.add(pairKey);
        }

        if (cell.partner === neighbor.name) {
          newMatchedPairs.add(cell.id);
          newMatchedPairs.add(neighbor.id);
          scoreDelta += 100;
        }
      }
    }
    
    if (currentlyFightingPairs.size > 0) {
      const penalty = -25 * currentlyFightingPairs.size;
      scoreDelta += penalty
    }
    
    if (scoreDelta !== 0) {
      setScore(prev => prev + scoreDelta);
    }

    setFightingIds(newFightingIds);
    if (newFightingIds.size > 0) {
      setTimeout(() => setFightingIds(new Set()), 1000);
    }

    if(newMatchedPairs.size > matchedPairs.size) {
        setMatchedPairs(newMatchedPairs);
    }
    
    if (newMatchedPairs.size === gameCouples.length * 2 && !gameOver && gameCouples.length > 0) {
      setGameOver(true);
    }
  }, [cells, matchedPairs, gameOver, gameCouples]);

  useEffect(() => {
    const timeoutId = setTimeout(checkMatches, 300);
    return () => clearTimeout(timeoutId);
  }, [cells, checkMatches]);

  const areNeighbors = (index1: number, index2: number) => {
    const gridWidth = Math.sqrt(GRID_SIZE);
    const row1 = Math.floor(index1 / gridWidth);
    const col1 = index1 % gridWidth;
    const row2 = Math.floor(index2 / gridWidth);
    const col2 = index2 % gridWidth;

    return (row1 === row2 && Math.abs(col1 - col2) === 1) || (col1 === col2 && Math.abs(row1 - row2) === 1);
  };

  const swapCells = useCallback((index1: number, index2: number) => {
    const cell1 = cells[index1];
    const cell2 = cells[index2];

    if (matchedPairs.has(cell1.id) || matchedPairs.has(cell2.id)) {
        return;
    }

    const newCells = [...cells];
    [newCells[index1], newCells[index2]] = [newCells[index2], newCells[index1]];

    updateCells(newCells);

  }, [cells, matchedPairs]);

  const handleCardClick = (index: number) => {
    const clickedCard = cells[index];
    if (matchedPairs.has(clickedCard.id)) {
        setSelectedCardIndex(null);
        return;
    }

    if (selectedCardIndex === null) {
      setSelectedCardIndex(index);
    } else {
        if (selectedCardIndex !== index) {
            if (areNeighbors(selectedCardIndex, index)) {
                swapCells(selectedCardIndex, index);
            }
        }
        setSelectedCardIndex(null);
    }
  };

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
    draggedItem.current = null;

    if (draggedIndex !== index) {
      if (areNeighbors(draggedIndex, index)) {
        swapCells(draggedIndex, index);
      }
    }
  };

  const handleUnlockCouple = () => {
    if (unlockedCouplesCount < gameCouples.length) {
      setScore(s => s - COUPLE_HINT_COST);
      setUnlockedCouplesCount(c => c + 1);
    }
  };

  const handleUnlockEx = () => {
    if (unlockedExesCount < gameExes.length) {
      setScore(s => s - EX_HINT_COST);
      setUnlockedExesCount(e => e + 1);
    }
  };


  if (!isClient) {
    return null;
  }

  return (
    <SidebarProvider>
      <HintSidebar
        couples={gameCouples}
        exes={gameExes}
        onUnlockCouple={handleUnlockCouple}
        onUnlockEx={handleUnlockEx}
        unlockedCouplesCount={unlockedCouplesCount}
        unlockedExesCount={unlockedExesCount}
        score={score}
      />
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
                  isSelected={selectedCardIndex === index}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleCardClick}
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
