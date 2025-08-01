"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { Celebrity, Cell } from "@/lib/types";
import { celebritiesData } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ZapOff, RotateCw, Trophy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { shuffle } from 'lodash';

const GRID_SIZE = 16;
const COUPLES_IN_GAME = 4;

const ScoreBoard = ({ score }: { score: number }) => (
  <div className="text-center mb-8">
    <h1 className="font-headline text-5xl md:text-6xl font-bold text-gray-800">Love Match Mania</h1>
    <p className="mt-4 text-2xl font-semibold text-primary">Score: {score}</p>
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
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "aspect-square transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing transform hover:scale-105",
        "relative group overflow-hidden rounded-xl shadow-lg",
        isMatched && "border-primary border-4 shadow-primary/50",
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


export default function Home() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [fightingIds, setFightingIds] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const draggedItem = useRef<number | null>(null);

  const setupGame = useCallback(() => {
    const couples = shuffle(celebritiesData.filter(c => c.partner)).slice(0, COUPLES_IN_GAME);
    let gameCelebs: Celebrity[] = [];
    couples.forEach(c => {
      gameCelebs.push(c);
      const partner = celebritiesData.find(p => p.name === c.partner);
      if(partner) gameCelebs.push(partner);
    });

    const fillers = shuffle(celebritiesData.filter(c => !c.partner && !gameCelebs.some(gc => gc.name === c.name))).slice(0, GRID_SIZE - gameCelebs.length);
    const initialCells = shuffle([...gameCelebs, ...fillers]);

    while(initialCells.length < GRID_SIZE) {
        initialCells.push({type: 'empty', id: `empty-${initialCells.length}`})
    }

    setCells(initialCells.slice(0, GRID_SIZE));
    setScore(0);
    setMatchedPairs(new Set());
    setFightingIds(new Set());
    setGameOver(false);
  }, []);

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

        // Check for exes
        if (cell.exes?.includes(neighbor.name)) {
          newFightingIds.add(cell.id);
          newFightingIds.add(neighbor.id);
          scoreDelta -= 10;
        }

        // Check for partners
        if (cell.partner === neighbor.name && !matchedPairs.has(cell.id)) {
          newMatchedPairs.add(cell.id);
          newMatchedPairs.add(neighbor.id);
          scoreDelta += 100;
        }
      }
    }

    if (newFightingIds.size > 0) {
      setFightingIds(newFightingIds);
      setTimeout(() => setFightingIds(new Set()), 1000);
    }
    
    if(newMatchedPairs.size > matchedPairs.size) {
        setMatchedPairs(newMatchedPairs);
    }
    
    if (scoreDelta !== 0) {
        setScore(prev => prev + scoreDelta);
    }
    
    if (newMatchedPairs.size === COUPLES_IN_GAME * 2) {
      setGameOver(true);
    }
  }, [cells, matchedPairs]);

  useEffect(() => {
    const timeoutId = setTimeout(checkMatches, 300);
    return () => clearTimeout(timeoutId);
  }, [cells, checkMatches]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
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
    
    const newCells = [...cells];
    const draggedCell = newCells[draggedIndex];

    if (matchedPairs.has(draggedCell.id)) return; // Prevent moving matched celebs

    [newCells[draggedIndex], newCells[index]] = [newCells[index], newCells[draggedIndex]]; // Swap
    setCells(newCells);
    draggedItem.current = null;
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <ScoreBoard score={score} />
        
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

        <div className="text-center">
          <Button onClick={setupGame} size="lg">
            <RotateCw className="mr-2 h-4 w-4" /> Reset Game
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
  );
}
