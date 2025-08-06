
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { Celebrity, Cell, LeaderboardEntry } from "@/lib/types";
import { celebritiesData } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, ZapOff, RotateCw, Trophy, Undo, Lock, Ban, Menu, HeartCrack, Share2, Info, Timer, Crown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { shuffle } from 'lodash';
import { useToast } from "@/hooks/use-toast";
import { i18n, Language } from '@/lib/i18n';
import { TelegramIcon } from '@/components/ui/telegram-icon';
import { TELEGRAM_APP_URL } from '@/lib/config';


const COUPLE_HINT_COST = 100;
const EX_HINT_COST = 50;
const WIN_SCORE = 500;


const gameModes = (lang: Language) => ({
  easy: { label: i18n[lang].easy, hintsUnlocked: true, namesVisible: true, gridSize: 16 },
  medium: { label: i18n[lang].medium, hintsUnlocked: false, namesVisible: true, gridSize: 25 },
  hard: { label: i18n[lang].hard, hintsUnlocked: false, namesVisible: false, gridSize: 36 },
});

type GameModeKey = keyof ReturnType<typeof gameModes>;


const ScoreBoard = ({ score, moves, time, lang }: { score: number, moves: number, time: string, lang: Language }) => (
  <div className="text-center">
    <h1 className="font-headline text-4xl md:text-5xl font-bold text-gray-800">Love Match Mania</h1>
    <p className="mt-2 text-xl md:text-2xl font-semibold text-primary whitespace-nowrap">{i18n[lang].score}: {score} | {i18n[lang].moves}: {moves} | {i18n[lang].time}: {time}</p>
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
  namesVisible,
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
  namesVisible: boolean;
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

  const showName = namesVisible || cell.revealed;
  const nameParts = cell.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');


  return (
    <div
      draggable={!isMatched}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onClick={() => onClick(index)}
    >
      <Card
        className={cn(
          "aspect-square w-full transition-all duration-300 ease-in-out transform hover:scale-105",
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
          {(showName || isMatched) && (
            <div className="absolute bottom-2 left-0 right-0 text-center px-1">
                <p className="font-bold text-white text-[0.5rem] sm:text-[0.6rem] md:text-xs leading-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                  {firstName}
                </p>
                <p className="font-bold text-white text-[0.5rem] sm:text-[0.6rem] md:text-xs leading-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                  {lastName}
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
  onShowInstructions,
  onShowLeaderboard,
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
  onShowInstructions: () => void;
  onShowLeaderboard: () => void;
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
        <h3 className="text-2xl font-bold font-headline text-sidebar-primary-foreground text-center">{i18n[lang].gameHints}</h3>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar p-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button variant="outline" size="lg" onClick={onShowInstructions} className="w-full justify-start">
                  <Info className="h-6 w-6" /> {i18n[lang].instructions}
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button variant="outline" size="lg" onClick={onShowLeaderboard} className="w-full justify-start">
                <Crown className="mr-2 h-6 w-6" /> {i18n[lang].leaderboard}
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <Separator className="my-4" />
        <div className="space-y-6">
          <Card className="bg-sidebar-accent border-accent/50 text-sidebar-foreground">
            <CardHeader>
              <h3 className="flex items-center gap-3 text-accent font-headline text-2xl font-semibold leading-none tracking-tight">
                <Heart className="text-accent" />
                {i18n[lang].findTheCouples}
              </h3>
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
                <Lock className="mr-2" /> {i18n[lang].unlock} ({COUPLE_HINT_COST} {i18n[lang].pts})
              </Button>
              {allCouplesRevealed && totalCouplesToFind > 0 && (
                <p className="text-sm text-center text-accent/80">{i18n[lang].allCoupleHintsUnlocked}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-sidebar-accent border-destructive/50 text-sidebar-foreground">
            <CardHeader>
              <h3 className="flex items-center gap-3 text-destructive font-headline text-2xl font-semibold leading-none tracking-tight">
                <HeartCrack className="text-destructive" />
                {i18n[lang].avoidTheExes}
              </h3>
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
                  <Lock className="mr-2" /> {i18n[lang].unlock} ({EX_HINT_COST} {i18n[lang].pts})
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

const Leaderboard = ({ lang, open, onOpenChange }: { lang: Language, open: boolean, onOpenChange: (open: boolean) => void }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('loveMatchLeaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, [open]);

  const sortData = (data: LeaderboardEntry[], criteria: 'score' | 'moves' | 'time') => {
    return [...data].sort((a, b) => {
      switch (criteria) {
        case 'score':
          return b.score - a.score;
        case 'moves':
          return a.moves - b.moves;
        case 'time':
          const timeA = a.time.split(':').reduce((acc, time) => (60 * acc) + +time);
          const timeB = b.time.split(':').reduce((acc, time) => (60 * acc) + +time);
          return timeA - timeB;
        default:
          return 0;
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-2xl font-headline">
            <Crown className="mr-2 h-6 w-6 text-yellow-500" />
            {i18n[lang].leaderboard}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="score">{i18n[lang].score}</TabsTrigger>
            <TabsTrigger value="moves">{i18n[lang].moves}</TabsTrigger>
            <TabsTrigger value="time">{i18n[lang].time}</TabsTrigger>
          </TabsList>
          {(['score', 'moves', 'time'] as const).map(criteria => (
            <TabsContent key={criteria} value={criteria}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{i18n[lang].name}</TableHead>
                    <TableHead className="text-right">{i18n[lang][criteria]}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortData(leaderboard, criteria).slice(0, 10).map((entry, index) => (
                    <TableRow key={entry.timestamp}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell className="text-right">{entry[criteria]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
        <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline">{i18n[lang].close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSubmitScore, setShowSubmitScore] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(25);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const draggedItem = useRef<number | null>(null);
  const fightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const areNeighbors = (index1: number, index2: number) => {
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
      return { ...c, name, partner, exes, revealed: false };
    });
  }, []);

  const setupGame = useCallback((modeKey: GameModeKey, language: Language) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    const currentModes = gameModes(language);
    const { hintsUnlocked, gridSize: newGridSize } = currentModes[modeKey];
    setGameModeKey(modeKey);
    setGridSize(newGridSize);
    
    const couplesToInclude = Math.floor(newGridSize / 9) + 2; // Scales with grid size
    
    const localizedCelebrities = getCelebrityDataByLang(language);

    let potentialCouples = shuffle(localizedCelebrities.filter(c =>
        c.partner && localizedCelebrities.find(p => p.name === c.partner) && (c.exes && c.exes.length > 0)
    ));
    
    let initialCouples: Celebrity[] = [];
    let celebsForGrid = new Set<string>();

    while (initialCouples.length < couplesToInclude && potentialCouples.length > 0) {
        const coupleCandidate = potentialCouples.pop()!;
        const partner = localizedCelebrities.find(p => p.name === coupleCandidate.partner)!;
        
        const exesOfCandidate = coupleCandidate.exes || [];
        const exesOfPartner = partner.exes || [];
        const allExesForPair = [...new Set([...exesOfCandidate, ...exesOfPartner])];

        const exCelebsInGame = allExesForPair.map(name => localizedCelebrities.find(c => c.name === name)).filter(Boolean) as Celebrity[];

        const tempCelebs = new Set([coupleCandidate.name, partner.name, ...exCelebsInGame.map(c => c.name)]);
        if (celebsForGrid.size + tempCelebs.size > newGridSize) {
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
            initialCouples.push(coupleCandidate);
            celebsForGrid.add(coupleCandidate.name);
            celebsForGrid.add(partner.name);
            exCelebsInGame.forEach(ex => celebsForGrid.add(ex.name));
        }
    }
    
    const fillers = shuffle(localizedCelebrities.filter(c => !celebsForGrid.has(c.name)));
    const remainingSlots = newGridSize - celebsForGrid.size;
    if (remainingSlots > 0) {
        fillers.slice(0, remainingSlots).forEach(f => celebsForGrid.add(f.name));
    }
    
    let finalCells: Cell[] = Array.from(celebsForGrid).map(name => {
        const celeb = localizedCelebrities.find(c => c.name === name)!;
        return {...celeb, type: 'celebrity' as const, revealed: false};
    });
    
    if (finalCells.length < newGridSize) {
        const emptyCellsCount = newGridSize - finalCells.length;
        for (let i = 0; i < emptyCellsCount; i++) {
            finalCells.push({ type: 'empty', id: `empty-${Date.now()}-${i}` });
        }
    }

    const finalCelebObjects = finalCells.filter(c => c.type === 'celebrity') as Celebrity[];
    const finalCelebNames = new Set(finalCelebObjects.map(c => c.name));

    const allPossibleCouplesInGrid: Celebrity[] = [];
    finalCelebObjects.forEach(celeb => {
        if (celeb.partner && finalCelebNames.has(celeb.partner)) {
            if (!allPossibleCouplesInGrid.some(c => c.name === celeb.partner)) {
                allPossibleCouplesInGrid.push(celeb);
            }
        }
    });
    setGameCouples(allPossibleCouplesInGrid);
    
    const exesInGame: { p1: string, p2: string }[] = [];
    for (const celeb of finalCelebObjects) {
        if (celeb.exes) {
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

    if (hintsUnlocked) {
      setUnlockedCoupleNames(new Set(allPossibleCouplesInGrid.map(c => c.name)));
      setUnlockedExesCount(exesInGame.length);
    } else {
      setUnlockedCoupleNames(new Set());
      setUnlockedExesCount(0);
    }

    const isLayoutInvalid = (layout: Cell[]): boolean => {
      const gridWidth = Math.sqrt(newGridSize);
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
    setMoves(0);
    setMatchedPairs(new Set());
    setFightingIds(new Set());
    setPenalizedExPairs(new Set());
    setGameOver(false);
    setIsStuck(false);
    setSelectedCardIndex(null);
    setStartTime(null);
    setElapsedTime('00:00');
    setFinalTime(null);
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

  const startTimer = useCallback(() => {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  useEffect(() => {
    if (startTime && !gameOver) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = now - startTime;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [startTime, gameOver]);


  useEffect(() => {
    setIsClient(true);
    const visited = localStorage.getItem('loveMatchManiaVisited');
    if (!visited) {
      setShowInstructionsPopup(true);
      localStorage.setItem('loveMatchManiaVisited', 'true');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      setupGame(gameModeKey, lang);
    }
  }, [setupGame, gameModeKey, lang, isClient]);
  

  const runChecks = useCallback(() => {
    if (gameOver || isStuck) return;

    let newFightingIds = new Set<string>();
    let localMatchedPairs = new Set(matchedPairs);
    let scoreDelta = 0;
    const gridWidth = Math.sqrt(gridSize);
    
    const currentlyFightingPairs = new Set<string>();
    const newPenalizedPairs = new Set(penalizedExPairs);
    const newCells = [...cells];

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.type === 'empty') continue;

      const neighbors = [i - 1, i + 1, i - gridWidth, i - gridWidth].filter(n =>
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
        
        const isGameCouple = gameCouples.some(c => 
          (c.name === cell.name && c.partner === neighbor.name) ||
          (c.name === neighbor.name && c.partner === cell.name)
        );

        if (cell.partner === neighbor.name && isGameCouple) {
          localMatchedPairs.add(cell.id);
          localMatchedPairs.add(neighbor.id);
          scoreDelta += 100;

          const cellInNew = newCells.find(c => c.id === cell.id);
          const neighborInNew = newCells.find(c => c.id === neighbor.id);
          if (cellInNew?.type === 'celebrity') cellInNew.revealed = true;
          if (neighborInNew?.type === 'celebrity') neighborInNew.revealed = true;
        }
      }
    }

    if (newCells.some((c, i) => c.type === 'celebrity' && c.revealed !== (cells[i] as any).revealed)) {
      setCells(newCells);
    }

    penalizedExPairs.forEach(pairKey => {
      if (!currentlyFightingPairs.has(pairKey)) {
        newPenalizedPairs.delete(pairKey);
      }
    });
    setPenalizedExPairs(newPenalizedPairs);
    
    let finalScore = score;
    if (scoreDelta !== 0) {
      finalScore = score + scoreDelta;
      setScore(finalScore);
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

    const allCouplesMatched = gameCouples.length > 0 && localMatchedPairs.size === gameCouples.length * 2;
    
    if (finalScore >= WIN_SCORE || (allCouplesMatched && finalScore > 0)) {
      setFinalTime(elapsedTime);
      setGameOver(true);
      setShowSubmitScore(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    
    if (allCouplesMatched && finalScore <= 0) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsStuck(true);
      return;
    }
    
    let hasMoves = false;
    const allCellsButEmpty = cells.filter(c => c.type !== 'empty');
    const nonMatchedCellsIndices = allCellsButEmpty
      .filter(c => !localMatchedPairs.has(c.id))
      .map(c => cells.findIndex(cell => cell.id === c.id));
    
    if(cells.some(c => c.type === 'empty') || nonMatchedCellsIndices.length > 1) {
        hasMoves = true;
    }
    
    if (!hasMoves && !allCouplesMatched) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsStuck(true);
    }
  }, [cells, matchedPairs, gameOver, isStuck, gameCouples, penalizedExPairs, elapsedTime, score, gridSize]);

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
    startTimer();
    const cell1 = cells[index1];
    const cell2 = cells[index2];

    if (matchedPairs.has(cell1.id) || matchedPairs.has(cell2.id)) {
        return;
    }

    const newCells = [...cells];
    [newCells[index1], newCells[index2]] = [newCells[index2], newCells[index1]];

    setMoves(m => m + 1);
    updateCells(newCells);

  }, [cells, matchedPairs, startTimer]);

  const handleCardClick = (index: number) => {
    if (gameOver || isStuck) return;
    const clickedCard = cells[index];
    if (matchedPairs.has(clickedCard.id)) {
        setSelectedCardIndex(null);
        return;
    }
    
    startTimer();

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
    
    startTimer();
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
        if(score >= COUPLE_HINT_COST) {
            setScore(s => s - COUPLE_HINT_COST);
            setUnlockedCoupleNames(prev => new Set(prev).add(nextUnrevealedCouple.name));
        }
    }
  };

  const handleUnlockEx = () => {
    if (unlockedExesCount < gameExes.length) {
       if (score >= EX_HINT_COST) {
        setScore(s => s - EX_HINT_COST);
        setUnlockedExesCount(e => e + 1);
       }
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

  const handleSubmitScore = () => {
    if (!playerName.trim()) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score,
      moves,
      time: finalTime || '00:00',
      timestamp: Date.now(),
    };
    
    const savedLeaderboard = localStorage.getItem('loveMatchLeaderboard');
    const leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
    leaderboard.push(newEntry);
    localStorage.setItem('loveMatchLeaderboard', JSON.stringify(leaderboard));
    
    setShowSubmitScore(false);
    setShowLeaderboard(true);
  };

  
  if (!isClient) {
    return null;
  }
  
  const gridDynamicStyle = {
    gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, minmax(0, 1fr))`
  };

  const currentModes = gameModes(lang);

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
        onShowInstructions={() => setShowInstructionsPopup(true)}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />
      <SidebarInset>
        <main className="min-h-screen w-full bg-background p-4 sm:p-8">
          <div className="max-w-7xl mx-auto relative">
             <div className="relative flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="md:flex-1 flex justify-start order-2 md:order-1">
                   <div className="flex flex-row md:flex-col items-center md:items-start gap-2">
                      <SidebarTrigger variant="outline" size="lg" className="min-w-[210px] justify-start">
                         <Menu className="h-6 w-6" /> {i18n[lang].hints}
                      </SidebarTrigger>
                      <Button variant="outline" size="lg" onClick={() => setShowInstructionsPopup(true)} className="min-w-[210px] justify-start hidden md:flex">
                         <Info className="h-6 w-6" /> {i18n[lang].instructions}
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setShowLeaderboard(true)} className="min-w-[210px] justify-start hidden md:flex">
                       <Crown className="mr-2 h-6 w-6" /> {i18n[lang].leaderboard}
                      </Button>
                   </div>
                </div>
               <div className="md:flex-1 order-1 md:order-2 text-center">
                 <ScoreBoard score={score} moves={moves} time={elapsedTime} lang={lang} />
               </div>
                <div className="md:flex-1 order-3 flex justify-center md:justify-end gap-2">
                 <Button onClick={() => setLang('en')} variant={lang === 'en' ? 'default' : 'outline'} size="sm">EN</Button>
                 <Button onClick={() => setLang('ru')} variant={lang === 'ru' ? 'default' : 'outline'} size="sm">RU</Button>
               </div>
             </div>

            <div className="flex justify-center gap-4 mb-8">
              {(Object.keys(currentModes) as GameModeKey[]).map(key => (
                  <Button 
                    key={key} 
                    onClick={() => handleGameModeChange(key)}
                    variant={gameModeKey === key ? 'default' : 'outline'}
                  >
                    {currentModes[key].label}
                  </Button>
              ))}
            </div>
            
            <div className="w-full max-w-3xl mx-auto">
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
                    namesVisible={currentModes[gameModeKey].namesVisible}
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
          <AlertDialog open={showInstructionsPopup} onOpenChange={setShowInstructionsPopup}>
            <AlertDialogContent className="max-h-[80svh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-headline">
                  {i18n[lang].welcomeTitle}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription asChild>
                <div className="text-sm text-muted-foreground space-y-4 py-4 text-left">
                  <div>
                    <p className="font-bold mb-2">{i18n[lang].rulesTitle}</p>
                    <p className='mb-2'>{i18n[lang].rule1.replace('{win_score}', WIN_SCORE.toString())}</p>
                    <div className="flex items-center justify-center gap-2 my-2 p-2 rounded-md bg-green-100/50">
                        <div className="relative w-16 h-16">
                            <Image src="/images/celebrities/Justin Bieber.png" alt="Justin Bieber" layout="fill" className="rounded-full object-cover" unoptimized/>
                        </div>
                        <Heart className="w-6 h-6 text-green-500" />
                        <div className="relative w-16 h-16">
                            <Image src="/images/celebrities/Hailey Bieber.png" alt="Hailey Bieber" layout="fill" className="rounded-full object-cover" unoptimized/>
                        </div>
                    </div>
                     <p className='text-center text-xs'>{i18n[lang].rule1_example}</p>

                    <p className='mt-2'>{i18n[lang].rule2}</p>
                     <div className="flex items-center justify-center gap-2 my-2 p-2 rounded-md bg-red-100/50">
                        <div className="relative w-16 h-16">
                            <Image src="/images/celebrities/Justin Bieber.png" alt="Justin Bieber" layout="fill" className="rounded-full object-cover" unoptimized/>
                        </div>
                        <HeartCrack className="w-6 h-6 text-red-500" />
                        <div className="relative w-16 h-16">
                            <Image src="/images/celebrities/Selena Gomez.png" alt="Selena Gomez" layout="fill" className="rounded-full object-cover" unoptimized/>
                        </div>
                    </div>
                    <p className='text-center text-xs'>{i18n[lang].rule2_example}</p>
                    <p className='mt-2'>{i18n[lang].rule3}</p>
                    <p className='mt-2'>{i18n[lang].rule4}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-bold mb-2">{i18n[lang].levelsTitle}</p>
                    <p><strong>{i18n[lang].easy}:</strong> {i18n[lang].levelEasy}</p>
                    <p><strong>{i18n[lang].medium}:</strong> {i18n[lang].levelMedium}</p>
                    <p><strong>{i18n[lang].hard}:</strong> {i18n[lang].levelHard}</p>
                  </div>
                </div>
              </AlertDialogDescription>
              <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowInstructionsPopup(false)} className="w-full flex-1">
                    {i18n[lang].letsPlay}
                  </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={gameOver && !showSubmitScore}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-center text-2xl font-headline">
                  <Trophy className="mr-4 h-10 w-10 text-yellow-500" />
                  {i18n[lang].congratulations}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {i18n[lang].gameOverText
                    .replace('{moves}', moves.toString())
                    .replace('{score}', score.toString())
                    .replace('{time}', finalTime || '00:00')}
                </AlertDialogDescription>
                <AlertDialogDescription>
                  {i18n[lang].gameOverInviteLine1}
                </AlertDialogDescription>
                <AlertDialogDescription>
                  {i18n[lang].gameOverInviteLine2}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <div className="w-full flex flex-col sm:flex-row gap-2">
                  <Button asChild className="bg-black hover:bg-gray-800 text-white flex-1">
                      <a href={TELEGRAM_APP_URL} target="_blank">
                        <TelegramIcon className="mr-2" />
                        {i18n[lang].becomeCelebricy}
                      </a>
                  </Button>
                    <Button onClick={handleShare} variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      {i18n[lang].shareWithFriend}
                    </Button>
                    <AlertDialogAction onClick={handleReset} className="flex-1">
                      {i18n[lang].playAgain}
                    </AlertDialogAction>
                  </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={showSubmitScore}>
            <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{i18n[lang].congratulations}</AlertDialogTitle>
                   <AlertDialogDescription>
                    {i18n[lang].gameOverText
                    .replace('{moves}', moves.toString())
                    .replace('{score}', score.toString())
                    .replace('{time}', finalTime || '00:00')}
                    <br/>
                    {i18n[lang].enterYourName}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      {i18n[lang].name}
                    </Label>
                    <Input
                      id="name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowSubmitScore(false)}>{i18n[lang].skip}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmitScore}>{i18n[lang].submitScore}</AlertDialogAction>
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
                <AlertDialogDescription>
                  {i18n[lang].noMoreSwaps}
                </AlertDialogDescription>
                <AlertDialogDescription>
                  {i18n[lang].yourFinalScore}
                  <span className="font-bold text-primary">{score}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleReset} className="w-full">
                  {i18n[lang].tryAgain}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           <Leaderboard lang={lang} open={showLeaderboard} onOpenChange={setShowLeaderboard} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
