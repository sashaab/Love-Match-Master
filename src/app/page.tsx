
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { Celebrity, Cell } from "@/lib/types";
import { celebritiesData } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ZapOff, RotateCw, Trophy, Undo, Lock, Ban, Menu, HeartCrack, Share2, Send } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { i18n, Language } from '@/lib/i18n';


const COUPLE_HINT_COST = 100;
const EX_HINT_COST = 50;

const gameModes = {
  easy: { gridSize: 9, couplesToInclude: 1, label: '3x3 (Easy)' },
  medium: { gridSize: 25, couplesToInclude: 3, label: '5x5 (Medium)' },
  hard: { gridSize: 36, couplesToInclude: 3, label: '6x6 (Hard)' },
};

type GameModeKey = keyof typeof gameModes;


const ScoreBoard = ({ score, moves, lang }: { score: number, moves: number, lang: Language }) => (
  <div className="text-center">
    <h1 className="font-headline text-4xl md:text-5xl font-bold text-gray-800">Love Match Mania</h1>
    <p className="mt-2 text-2xl font-semibold text-primary">{i18n[lang].score}: {score} | {i18n[lang].moves}: {moves}</p>
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

  const nameParts = cell.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

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
        isMatched ? "border-accent border-4 shadow-accent/50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
        isFighting && "animate-shake border-destructive border-4 shadow-destructive/50",
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
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-2" />
        <p className="absolute bottom-2 left-0 right-0 text-center font-bold text-white text-[0.5rem] sm:text-sm md:text-base px-1 leading-tight">
          {firstName}<br/>{lastName}
        </p>
        {isMatched && (
          <div className="absolute inset-0 bg-accent/30 flex items-center justify-center">
            <Heart className="w-8 h-8 md:w-16 md:h-16 text-white animate-pulse" fill="white" />
          </div>
        )}
        {isFighting && (
          <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center">
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
  unlockedCoupleNames,
  unlockedExesCount,
  matchedPairs,
  allCells,
  lang,
}: {
  couples: Celebrity[];
  exes: { p1: string; p2: string }[];
  onUnlockCouple: () => void;
  onUnlockEx: () => void;
  unlockedCoupleNames: Set<string>;
  unlockedExesCount: number;
  matchedPairs: Set<string>;
  allCells: Cell[];
  lang: Language;
}) => {
  const unlockedByPoints = couples.filter(c => unlockedCoupleNames.has(c.name));

  const matchedOnBoard = couples.filter(couple => {
    const p1 = allCells.find(c => c.type === 'celebrity' && c.name === couple.name);
    const p2 = allCells.find(c => c.type === 'celebrity' && c.name === couple.partner);
    return p1 && p2 && matchedPairs.has(p1.id) && matchedPairs.has(p2.id);
  });
  
  const revealedCouples = [...new Map([...unlockedByPoints, ...matchedOnBoard].map(item => [item.name, item])).values()];
  const revealedExes = exes.slice(0, unlockedExesCount);
  const totalCouplesToFind = couples.length;
  const allCouplesRevealed = revealedCouples.length === totalCouplesToFind;

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-accent p-4">
        <h2 className="text-2xl font-bold font-headline text-sidebar-primary-foreground text-center">{i18n[lang].gameHints}</h2>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-4">
        <div className="space-y-6">
          <Card className="bg-sidebar-accent border-accent/50 text-sidebar-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-accent font-headline">
                <Heart className="text-accent" />
                {i18n[lang].findTheCouples}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {revealedCouples.length > 0 && (
                  <ul className="space-y-2 text-sm">
                    {revealedCouples.map((c, i) => (
                      <li key={`couple-${i}`} className="bg-background/10 p-2 rounded-md font-medium">{c.name} & {c.partner}</li>
                    ))}
                  </ul>
              )}
              <Button onClick={onUnlockCouple} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={allCouplesRevealed}>
                <Lock className="mr-2" /> {i18n[lang].unlock} ({COUPLE_HINT_COST} pts)
              </Button>
              {allCouplesRevealed && totalCouplesToFind > 0 && (
                <p className="text-sm text-center text-accent/80">{i18n[lang].allCoupleHintsUnlocked}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-sidebar-accent border-destructive/50 text-sidebar-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-destructive font-headline">
                <HeartCrack className="text-destructive" />
                {i18n[lang].avoidTheExes}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {revealedExes.length > 0 && (
                   <ul className="space-y-2 text-sm">
                    {revealedExes.map((e, i) => (
                      <li key={`ex-${i}`} className="bg-background/10 p-2 rounded-md font-medium">{e.p1} & {e.p2}</li>
                    ))}
                  </ul>
              )}
               <Button onClick={onUnlockEx} variant="destructive" className="w-full" disabled={unlockedExesCount === exes.length}>
                  <Lock className="mr-2" /> {i18n[lang].unlock} ({EX_HINT_COST} pts)
                </Button>
               {unlockedExesCount === exes.length && exes.length > 0 && (
                <p className="text-sm text-center text-destructive/80">{i18n[lang].allExHintsUnlocked}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};


export default function Home() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [history, setHistory] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [fightingIds, setFightingIds] = useState<Set<string>>(new Set());
  const [penalizedExPairs, setPenalizedExPairs] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [gameCouples, setGameCouples] = useState<Celebrity[]>([]);
  const [gameExes, setGameExes] = useState<{p1: string, p2: string}[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [unlockedCoupleNames, setUnlockedCoupleNames] = useState<Set<string>>(new Set());
  const [unlockedExesCount, setUnlockedExesCount] = useState(0);
  const [gameModeKey, setGameModeKey] = useState<GameModeKey>('medium');
  const [lang, setLang] = useState<Language>('en');
  const { toast } = useToast();

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
  
  const getCelebrityDataByLang = useCallback((lang: Language) => {
    return celebritiesData.map(c => {
      const name = typeof c.name === 'object' ? c.name[lang] : c.name;
      const partner = c.partner && (typeof c.partner === 'object' ? c.partner[lang] : c.partner);
      const exes = c.exes?.map(e => typeof e === 'object' ? e[lang] : e);
      return { ...c, name, partner, exes };
    });
  }, []);

  const setupGame = useCallback((modeKey: GameModeKey, language: Language) => {
    const { gridSize, couplesToInclude } = gameModes[modeKey];
    setGameModeKey(modeKey);
    
    const localizedCelebrities = getCelebrityDataByLang(language);

    let potentialCouples = shuffle(localizedCelebrities.filter(c =>
        c.partner && localizedCelebrities.find(p => p.name === c.partner) && (c.exes && c.exes.length > 0)
    ));
    
    let selectedCouples: Celebrity[] = [];
    let celebsForGrid = new Set<string>();

    while (selectedCouples.length < couplesToInclude && potentialCouples.length > 0) {
        const coupleCandidate = potentialCouples.pop()!;
        const partner = localizedCelebrities.find(p => p.name === coupleCandidate.partner)!;
        
        const exesOfCandidate = coupleCandidate.exes || [];
        const exesOfPartner = partner.exes || [];
        const allExesForPair = [...new Set([...exesOfCandidate, ...exesOfPartner])];

        const exCelebsInGame = allExesForPair.map(name => localizedCelebrities.find(c => c.name === name)).filter(Boolean) as Celebrity[];

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
    
    const fillers = shuffle(localizedCelebrities.filter(c => !celebsForGrid.has(c.name)));
    const remainingSlots = gridSize - celebsForGrid.size;
    if (remainingSlots > 0) {
        fillers.slice(0, remainingSlots).forEach(f => celebsForGrid.add(f.name));
    }
    
    let finalCells: Cell[] = Array.from(celebsForGrid).map(name => {
        const celeb = localizedCelebrities.find(c => c.name === name)!;
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
    setMoves(0);
    setMatchedPairs(new Set());
    setFightingIds(new Set());
    setPenalizedExPairs(new Set());
    setGameOver(false);
    setIsStuck(false);
    setSelectedCardIndex(null);
    setUnlockedCoupleNames(new Set());
    setUnlockedExesCount(0);
  }, [getCelebrityDataByLang]);

  const updateCells = (newCells: Cell[]) => {
    setHistory(prev => [...prev, newCells]);
    setCells(newCells);
  }

  const undoMove = () => {
    if (history.length > 1) {
      setMoves(m => m - 1);
      const lastState = history[history.length - 2];
      setCells(lastState);
      setHistory(prev => prev.slice(0, -1));
    }
  }


  useEffect(() => {
    setIsClient(true);
    setupGame(gameModeKey, lang);
  }, [setupGame, gameModeKey, lang]);

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
    
    if (fightTimeoutRef.current) {
      clearTimeout(fightTimeoutRef.current);
      fightTimeoutRef.current = null;
    }

    setFightingIds(newFightingIds);

    if (newFightingIds.size > 0) {
        fightTimeoutRef.current = setTimeout(() => {
            setFightingIds(new Set());
            fightTimeoutRef.current = null;
        }, 1000);
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
  }, [cells, matchedPairs, gameOver, isStuck, gameCouples, gameModeKey, penalizedExPairs]);

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

    setMoves(m => m + 1);
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
    const matchedOnBoard = gameCouples.filter(couple => {
      const p1 = cells.find(c => c.type === 'celebrity' && c.name === couple.name);
      const p2 = cells.find(c => c.type === 'celebrity' && c.name === couple.partner);
      return p1 && p2 && matchedPairs.has(p1.id) && matchedPairs.has(p2.id);
    });

    const revealedCoupleNames = new Set([...unlockedCoupleNames, ...matchedOnBoard.map(c => c.name)]);

    const nextUnrevealedCouple = gameCouples.find(c => !revealedCoupleNames.has(c.name));

    if (nextUnrevealedCouple) {
        setScore(s => s - COUPLE_HINT_COST);
        setUnlockedCoupleNames(prev => new Set(prev).add(nextUnrevealedCouple.name));
    }
  };

  const handleUnlockEx = () => {
    if (unlockedExesCount < gameExes.length) {
      setScore(s => s - EX_HINT_COST);
      setUnlockedExesCount(e => e + 1);
    }
  };

  const handleReset = () => {
    setupGame(gameModeKey, lang);
  }
  
  const handleGameModeChange = (modeKey: GameModeKey) => {
    setupGame(modeKey, lang);
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: i18n[lang].linkCopiedTitle,
      description: i18n[lang].linkCopiedDescription,
    });
  };

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
        unlockedCoupleNames={unlockedCoupleNames}
        unlockedExesCount={unlockedExesCount}
        matchedPairs={matchedPairs}
        allCells={cells}
        lang={lang}
      />
      <SidebarInset>
        <main className="min-h-screen w-full bg-background p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex-none sm:w-[136px] order-2 sm:order-1">
                    <SidebarTrigger variant="outline" size="lg">
                        <Menu className="h-6 w-6" /> {i18n[lang].hints}
                    </SidebarTrigger>
                </div>
               <div className="flex-grow order-1 sm:order-2 text-center">
                 <ScoreBoard score={score} moves={moves} lang={lang} />
                 <div className="mt-4 text-sm text-gray-600 max-w-none mx-auto">
                    <p>{i18n[lang].appDescription1}</p>
                    <p>{i18n[lang].appDescription2}</p>
                  <Button asChild className="mt-4 bg-black text-white hover:bg-gray-800">
                    <a href="https://t.me/celebricy_bot/startttt?startapp=fOYOCKlN" target="_blank">
                      <Send className="mr-2" />
                      {i18n[lang].sendToExpertButton}
                    </a>
                  </Button>
                </div>
               </div>
               <div className="flex-none sm:w-[136px] flex justify-end gap-2 order-3">
                 <Button onClick={() => setLang('en')} variant={lang === 'en' ? 'default' : 'outline'} size="sm">EN</Button>
                 <Button onClick={() => setLang('ru')} variant={lang === 'ru' ? 'default' : 'outline'} size="sm">RU</Button>
               </div>
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
            
            <div className="w-full max-w-2xl mx-auto">
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
            </div>

            <div className="flex justify-center items-center gap-4">
              <Button onClick={handleReset} size="lg">
                <RotateCw className="mr-2 h-4 w-4" /> {i18n[lang].resetGame}
              </Button>
              <Button onClick={undoMove} size="lg" variant="outline" disabled={history.length <= 1}>
                <Undo className="mr-2 h-4 w-4" /> {i18n[lang].undo}
              </Button>
            </div>
          </div>
          <AlertDialog open={gameOver}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-center text-2xl font-headline">
                  <Trophy className="mr-4 h-10 w-10 text-yellow-500" />
                  {i18n[lang].congratulations}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-lg pt-4">
                  {i18n[lang].youMatchedAllCouples}
                  <br />
                  {i18n[lang].yourFinalScore} <span className="font-bold text-primary">{score}</span>
                  <br /><br />
                  {i18n[lang].wantMoreGames}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                 <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                    <a href="https://t.me/celebricy_bot/startttt?startapp=fOYOCKlN" target="_blank">
                      <Send className="mr-2" />
                      {i18n[lang].joinProject}
                    </a>
                  </Button>
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 w-full gap-2 sm:gap-0 mt-2">
                  <Button onClick={handleShare} variant="outline" className="w-full sm:w-auto">
                    <Share2 className="mr-2 h-4 w-4" />
                    {i18n[lang].shareWithFriend}
                  </Button>
                  <AlertDialogAction onClick={handleReset} className="w-full sm:w-auto">
                    {i18n[lang].playAgain}
                  </AlertDialogAction>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={isStuck}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-center text-2xl font-headline">
                  <Ban className="mr-4 h-10 w-10 text-destructive" />
                  {i18n[lang].noMoreMoves}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-lg pt-4">
                  {i18n[lang].noMoreSwaps}
                  <br />
                  {i18n[lang].yourFinalScore} <span className="font-bold text-primary">{score}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleReset} className="w-full">
                  {i18n[lang].tryAgain}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    