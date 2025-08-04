
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { Celebrity, Cell } from "@/lib/types";
import { celebritiesData } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ZapOff, RotateCw, Trophy, Undo, Lock, Ban, Menu } from "lucide-react";
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

const COUPLE_HINT_COST = 100;
const EX_HINT_COST = 50;

const gameModes = {
  easy: { gridSize: 9, couplesToInclude: 1, label: '3x3 (Easy)' },
  medium: { gridSize: 25, couplesToInclude: 3, label: '5x5 (Medium)' },
  hard: { gridSize: 100, couplesToInclude: 5, label: '10x10 (Hard)' },
};

type GameModeKey = keyof typeof gameModes;


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
        className="aspect-square rounded-full bg-background/50 border-2 border-dashed border-gray-300"
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
        "relative group overflow-hidden rounded-full shadow-lg",
        isMatched ? "border-primary border-4 shadow-primary/50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
        isFighting && "animate-shake border-red-500 border-4 shadow-red-500/50",
        isSelected && !isMatched && "ring-4 ring-blue-500 ring-offset-2"
      )}
    >
      <CardContent className="p-0 relative h-full w-full">
        <Image
          src={cell.imageUrl}
          alt={cell.name}
          fill={true}
          sizes="(max-width: 768px) 30vw, (max-width: 1200px) 15vw, 10vw"
          className="w-full h-full object-cover"
          data-ai-hint="celebrity portrait"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <p className="absolute bottom-2 left-0 right-0 text-center font-bold text-white text-[0.5rem] sm:text-sm md:text-base px-1">
          {cell.name}
        </p>
        {isMatched && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <Heart className="w-8 h-8 md:w-16 md:h-16 text-white animate-pulse" fill="white" />
          </div>
        )}
        {isFighting && (
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
            <ZapOff className="w-8 h-8 md:w-16 md:h-16 text-white" fill="white" />
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
    <Sidebar collapsible="offcanvas" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-accent">
        <div className="flex items-center gap-2 p-2 justify-center">
          <h2 className="text-2xl font-bold font-headline text-sidebar-primary-foreground">Hints</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-300">
              Match these couples!
            </h3>
            {revealedCouples.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {revealedCouples.map((c, i) => (
                    <li key={`couple-${i}`} className="text-sm bg-sidebar-accent/50 p-2 rounded-md">{c.name} & {c.partner}</li>
                  ))}
                </ul>
            )}
            {unlockedCouplesCount < couples.length && (
              <Button onClick={onUnlockCouple} className="w-full" disabled={score < COUPLE_HINT_COST}>
                <Lock className="mr-2" /> Unlock for {COUPLE_HINT_COST} points
              </Button>
            )}
          </div>

          <Separator className="bg-sidebar-border" />

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-400">
              Don't match these exes!
            </h3>
            {revealedExes.length > 0 && (
                 <ul className="space-y-2 mb-4">
                  {revealedExes.map((e, i) => (
                    <li key={`ex-${i}`} className="text-sm bg-sidebar-accent/50 p-2 rounded-md">{e.p1} & {e.p2}</li>
                  ))}
                </ul>
            )}
            {unlockedExesCount < exes.length && (
              <Button onClick={onUnlockEx} className="w-full" disabled={score < EX_HINT_COST}>
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
  const [penalizedExPairs, setPenalizedExPairs] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [gameCouples, setGameCouples] = useState<Celebrity[]>([]);
  const [gameExes, setGameExes] = useState<{p1: string, p2: string}[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [unlockedCouplesCount, setUnlockedCouplesCount] = useState(0);
  const [unlockedExesCount, setUnlockedExesCount] = useState(0);
  const [gameModeKey, setGameModeKey] = useState<GameModeKey>('medium');

  const draggedItem = useRef<number | null>(null);
  const fightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const areNeighbors = (index1: number, index2: number) => {
    const { gridSize } = gameModes[gameModeKey];
    const gridWidth = Math.sqrt(gridSize);
    const row1 = Math.floor(index1 / gridWidth);
    const col1 = index1 % gridWidth;
    const row2 = Math.floor(index2 / gridWidth);
    const col2 = index2 % gridWidth;

    return (row1 === row2 && Math.abs(col1 - col2) === 1) || (col1 === col2 && Math.abs(row1 - row2) === 1);
  };

  const setupGame = useCallback((modeKey: GameModeKey) => {
    const { gridSize, couplesToInclude } = gameModes[modeKey];
    setGameModeKey(modeKey);

    let potentialCouples = shuffle(celebritiesData.filter(c =>
        c.partner && celebritiesData.find(p => p.name === c.partner) && (c.exes && c.exes.length > 0)
    ));
    
    let selectedCouples: Celebrity[] = [];
    let celebsForGrid = new Set<string>();

    while (selectedCouples.length < couplesToInclude && potentialCouples.length > 0) {
        const coupleCandidate = potentialCouples.pop()!;
        const partner = celebritiesData.find(p => p.name === coupleCandidate.partner)!;
        
        const exesOfCandidate = coupleCandidate.exes || [];
        const exesOfPartner = partner.exes || [];
        const allExesForPair = [...new Set([...exesOfCandidate, ...exesOfPartner])];

        const exCelebsInGame = allExesForPair.map(name => celebritiesData.find(c => c.name === name)).filter(Boolean) as Celebrity[];

        const tempCelebs = new Set([coupleCandidate.name, partner.name, ...exCelebsInGame.map(c => c.name)]);
        if (celebsForGrid.size + tempCelebs.size > gridSize) {
            continue;
        }

        let coupleHasValidExPair = false;
        for (const celeb of [coupleCandidate, partner]) {
            if (celeb.exes) {
                for (const exName of celeb.exes) {
                    if (exCelebsInGame.find(c => c.name === exName)) {
                        coupleHasValidExPair = true;
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
    const remainingSlots = gridSize - celebsForGrid.size;
    if (remainingSlots > 0) {
        fillers.slice(0, remainingSlots).forEach(f => celebsForGrid.add(f.name));
    }
    
    let finalCells: Cell[] = Array.from(celebsForGrid).map(name => {
        const celeb = celebritiesData.find(c => c.name === name)!;
        return {...celeb, type: 'celebrity' as const};
    });
    
    if (finalCells.length < gridSize) {
        const emptyCellsCount = gridSize - finalCells.length;
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
      const gridWidth = Math.sqrt(gridSize);
      for (let i = 0; i < layout.length; i++) {
        const cell = layout[i];
        if (cell.type === 'empty') continue;

        const neighbors = [i - 1, i + 1, i - gridWidth, i - gridWidth].filter(n =>
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
    setPenalizedExPairs(new Set());
    setGameOver(false);
    setIsStuck(false);
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
    setupGame(gameModeKey);
  }, [setupGame, gameModeKey]);

  const runChecks = useCallback(() => {
    if (gameOver || isStuck) return;

    let newFightingIds = new Set<string>();
    let localMatchedPairs = new Set(matchedPairs);
    let scoreDelta = 0;
    const { gridSize } = gameModes[gameModeKey];
    const gridWidth = Math.sqrt(gridSize);
    
    const currentlyFightingPairs = new Set<string>();
    const newPenalizedPairs = new Set(penalizedExPairs);

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
        
        const isAlreadyMatched = localMatchedPairs.has(cell.id) || localMatchedPairs.has(neighbor.id);
        if (isAlreadyMatched) continue;

        const pairKey = [cell.name, neighbor.name].sort().join('-');
        
        if (cell.exes?.includes(neighbor.name)) {
          newFightingIds.add(cell.id);
          newFightingIds.add(neighbor.id);
          currentlyFightingPairs.add(pairKey);
          
          if (!penalizedExPairs.has(pairKey)) {
              scoreDelta -= 25;
              newPenalizedPairs.add(pairKey);
          }
        }

        if (cell.partner === neighbor.name) {
          localMatchedPairs.add(cell.id);
          localMatchedPairs.add(neighbor.id);
          scoreDelta += 100;
        }
      }
    }

    penalizedExPairs.forEach(pairKey => {
      if (!currentlyFightingPairs.has(pairKey)) {
        newPenalizedPairs.delete(pairKey);
      }
    });
    setPenalizedExPairs(newPenalizedPairs);
    
    if (scoreDelta !== 0) {
      setScore(prev => prev + scoreDelta);
    }
    
    if (newFightingIds.size > 0) {
        if (fightTimeoutRef.current) {
            clearTimeout(fightTimeoutRef.current);
        }
        setFightingIds(newFightingIds);
        fightTimeoutRef.current = setTimeout(() => {
            setFightingIds(new Set());
            fightTimeoutRef.current = null;
        }, 1000);
    } else if (fightingIds.size > 0) {
        setFightingIds(new Set());
    }

    if(localMatchedPairs.size > matchedPairs.size) {
        setMatchedPairs(localMatchedPairs);
    }
    
    if (gameCouples.length > 0 && localMatchedPairs.size === gameCouples.length * 2) {
      setGameOver(true);
      return;
    }
    
    let hasMoves = false;
    const nonMatchedCelebs = cells.filter(c => c.type === 'celebrity' && !localMatchedPairs.has(c.id));
    const emptyCells = cells.filter(c => c.type === 'empty');

    if (emptyCells.length > 0 || nonMatchedCelebs.length > 1) {
       hasMoves = true;
    }
    
    if (!hasMoves && gameCouples.length > 0) {
      setIsStuck(true);
    }
  }, [cells, matchedPairs, gameOver, isStuck, gameCouples, gameModeKey, penalizedExPairs, fightingIds]);

  useEffect(() => {
    const checkTimeout = setTimeout(runChecks, 300);
    return () => {
      clearTimeout(checkTimeout);
      if (fightTimeoutRef.current) {
        clearTimeout(fightTimeoutRef.current);
      }
    };
  }, [cells, runChecks]);

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
    if (gameOver || isStuck) return;
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
    if (matchedPairs.has(cells[index].id) || gameOver || isStuck) {
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

  const handleReset = () => {
    setupGame(gameModeKey);
  }
  
  const handleGameModeChange = (modeKey: GameModeKey) => {
    setupGame(modeKey);
  }

  const { gridSize } = gameModes[gameModeKey];
  
  if (!isClient) {
    return null;
  }
  
  const gridDynamicStyle = {
    gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, minmax(0, 1fr))`
  };


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
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <SidebarTrigger variant="outline" size="lg">
                <Menu className="h-6 w-6" /> Hints
              </SidebarTrigger>

              <div className="flex-grow">
                <ScoreBoard score={score} />
              </div>
              <div className="w-auto sm:w-[120px]"></div> {/* Spacer for symmetry */}
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {(Object.keys(gameModes) as GameModeKey[]).map(key => (
                  <Button 
                    key={key} 
                    onClick={() => handleGameModeChange(key)}
                    variant={gameModeKey === key ? 'default' : 'outline'}
                  >
                    {gameModes[key].label}
                  </Button>
              ))}
            </div>
            
            <div className="grid gap-2 md:gap-4 mb-8" style={gridDynamicStyle}>
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
              <Button onClick={handleReset} size="lg">
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
                <AlertDialogAction onClick={handleReset} className="w-full">
                  Play Again
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={isStuck}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-center text-2xl font-headline">
                  <Ban className="mr-4 h-10 w-10 text-destructive" />
                  No More Moves!
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-lg pt-4">
                  You've run out of available swaps. The game is over.
                  <br />
                  Your final score is: <span className="font-bold text-primary">{score}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleReset} className="w-full">
                  Try Again
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
